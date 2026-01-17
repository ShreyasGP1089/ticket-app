import imaplib
import email
import os
import time
import uuid
import random
import smtplib
import requests
import logging
import json
from email.utils import parseaddr
from email.message import EmailMessage
from transformers import pipeline
from datetime import datetime
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential

# Configure logging
logging.basicConfig(
    filename="bot.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Starting ResolveRight Email Bot")

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
EMAIL_ACCOUNT = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASS")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "60"))
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080/ticket")

# Track processed emails to prevent duplicates
processed_email_ids = set()

# Hugging Face classifier
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")


# Valid categories for support tickets
valid_labels = [
    "Technology",
    "Accounts",
    "Delivery",
    "Finance",
    "Product",
    "Refund"
]

# Labels to ignore/skip
IGNORED_LABELS = {
    "Spam", 
    "Marketing", 
    "Promotional", 
    "Irrelevant", 
    "Newsletter"
}

# Combined labels for classification
candidate_labels = valid_labels + list(IGNORED_LABELS)

# Blocked keywords in sender email/name
BLOCKED_SENDERS = [
    "clerk", 
    "gamma", 
    "canva", 
    "newsletter", 
    "no-reply", 
    "noreply",
    "updates", 
    "marketing",
    "promotions"
]

def generate_ticket_id():
    return f"RSL-{random.randint(1000, 9999)}-{uuid.uuid4().hex[:3].upper()}"

def send_auto_reply(to_email, ticket_id):
    try:
        msg = EmailMessage()
        msg["Subject"] = "Ticket Confirmation"
        msg["From"] = EMAIL_ACCOUNT
        msg["To"] = to_email
        msg.set_content(f"""Hi there 👋,

Your ticket has been successfully raised ✅  
🎟 Ticket ID: #{ticket_id}

Our team will get back to you shortly.

Regards,  
Resolveright Support 🤖
""")
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        with smtplib.SMTP(smtp_server, 587) as server:
            server.starttls()
            server.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
            server.send_message(msg)
            logger.info(f"Sent auto-reply to {to_email} for ticket {ticket_id}")
            print(f"✅ Sent auto-reply to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send auto-reply to {to_email}: {e}")
        print(f"❌ Failed to send auto-reply: {e}")

@retry(stop=stop_after_attempt(5), wait=wait_exponential(min=2, max=20))
def post_ticket_to_backend(payload):
    """Post ticket to backend with retry logic"""
    logger.info(f"Posting ticket {payload['ticketId']} to backend")
    response = requests.post(BACKEND_URL, json=payload, timeout=10)
    response.raise_for_status()
    logger.info(f"Ticket {payload['ticketId']} posted successfully")
    return response

def classify_and_post(sender_email, message, ticket_id):
    try:
        timestamp = datetime.now().isoformat()
        
        # 1. Check for Blocked Senders
        if any(keyword in sender_email.lower() for keyword in BLOCKED_SENDERS):
            logger.info(f"🚫 Skipped blocked sender: {sender_email}")
            print(f"🚫 Skipped blocked sender: {sender_email}")
            return

        logger.info(f"Classifying email from {sender_email}")
        
        # Use full message for AI classification
        result = classifier(message, candidate_labels)
        top_category = result["labels"][0]
        confidence = round(result["scores"][0], 4)
        
        logger.info(f"Email classified as {top_category} with {confidence*100}% confidence")

        # 2. Check for Spam/Irrelevant Content
        # Only skip if we are fairly confident (e.g., > 40%) that it is spam/irrelevant
        # Low confidence "Social" or "Marketing" might be a false positive (like the user's "Delivery" email)
        if top_category in IGNORED_LABELS:
            if confidence > 0.4:
                logger.info(f"🚫 Skipped irrelevant email from {sender_email} (Category: {top_category}, Confidence: {confidence})")
                print(f"🚫 Skipped irrelevant email from {sender_email} (Category: {top_category}, Confidence: {confidence})")
                return
            else:
                # Low confidence spam detection -> Treat as valid ticket (Safety Net)
                logger.info(f"⚠️ Low confidence for {top_category} ({confidence}). Treating as 'Technology' ticket to be safe.")
                top_category = "Technology"

        payload = {
            "ticketId": ticket_id,
            "message": message,
            "category": top_category,
            "confidence": confidence,
            "senderEmail": sender_email,
            "status": "Open",
            "createdAt": timestamp,
            "resolvedAt": None
        }

        # Save locally for debug/log
        with open("messages.json", "w") as f:
            json.dump(payload, f, indent=4)

        # Post with retry logic and send auto-reply ONLY if valid ticket
        response = post_ticket_to_backend(payload)
        if response.status_code in [200, 201, 202]:
            logger.info(f"Ticket {ticket_id} sent to backend successfully")
            print(f"🚀 Ticket {ticket_id} sent to backend successfully.")
            send_auto_reply(sender_email, ticket_id)
        else:
            logger.warning(f"Backend returned status {response.status_code}: {response.text}")
            print(f"⚠️ Backend error: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Failed to process ticket {ticket_id}: {e}")
        print(f"❌ Failed to send to backend: {e}")

def process_folder_emails(mail, folder_name):
    """Process unread emails from a specific folder"""
    try:
        # Select the folder
        status, _ = mail.select(f'"{folder_name}"' if "/" in folder_name else folder_name)
        if status != "OK":
            logger.warning(f"Could not access folder: {folder_name}")
            return 0
        
        result, data = mail.search(None, "(UNSEEN)")
        if result == "OK":
            email_count = len(data[0].split()) if data[0] else 0
            if email_count > 0:
                logger.info(f"Found {email_count} unread email(s) in {folder_name}")
            
            for num in data[0].split():
                result, msg_data = mail.fetch(num, "(RFC822)")
                if result == "OK":
                    msg = email.message_from_bytes(msg_data[0][1])
                    
                    # Get unique message ID for duplicate detection
                    message_id = msg.get("Message-ID", "")
                    
                    # Check for duplicates
                    if message_id in processed_email_ids:
                        logger.info(f"Skipping duplicate email: {message_id}")
                        print(f"⏭️ Skipping duplicate email")
                        continue
                    
                    # Add to processed set
                    processed_email_ids.add(message_id)
                    
                    sender = msg.get("From", "")
                    sender_email = parseaddr(sender)[1]
                    subject = msg.get("Subject", "No Subject")

                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain" and part.get_payload(decode=True):
                                body = part.get_payload(decode=True).decode(errors="ignore")
                                break
                    else:
                        body = msg.get_payload(decode=True).decode(errors="ignore")

                    if body:
                        folder_label = "📧 Spam" if "spam" in folder_name.lower() else "📨 Inbox"
                        logger.info(f"Processing email from {sender_email} ({folder_label}) - Subject: {subject}")
                        print(f"{folder_label} message from {sender_email}")
                        ticket_id = generate_ticket_id()
                        # Removed premature send_auto_reply here - moved to inside classify_and_post upon success
                        classify_and_post(sender_email, body.strip(), ticket_id)
                    else:
                        logger.warning(f"Empty email body from {sender_email}")
            
            return email_count
        return 0
    except Exception as e:
        logger.error(f"Error processing folder {folder_name}: {e}")
        return 0

def process_emails():
    try:
        logger.info("Checking for new emails in inbox and spam...")
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD)
        
        # Process inbox
        inbox_count = process_folder_emails(mail, "inbox")
        
        # Process spam folder (Gmail uses "[Gmail]/Spam")
        spam_count = process_folder_emails(mail, "[Gmail]/Spam")
        
        total_count = inbox_count + spam_count
        if total_count > 0:
            logger.info(f"Processed {total_count} total email(s) - Inbox: {inbox_count}, Spam: {spam_count}")

        mail.logout()
        logger.info("Email check completed successfully")
    except Exception as e:
        logger.error(f"Error processing emails: {e}")
        print(f"❌ Error: {e}")

# Main loop
while True:
    process_emails()
    print("⏳ Waiting for next check...\n")
    time.sleep(CHECK_INTERVAL)
