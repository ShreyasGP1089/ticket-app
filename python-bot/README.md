# Python Email Bot - Environment Setup

## Security Update ✅

This bot now uses environment variables for sensitive configuration instead of hardcoded values.

## Setup Instructions

### 1. Install Dependencies
```bash
pip install python-dotenv transformers torch requests tenacity
```

### 2. Configure Environment Variables

Copy the example file and add your credentials:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
IMAP_SERVER=imap.gmail.com
SMTP_SERVER=smtp.gmail.com
BACKEND_URL=http://localhost:8080/ticket
CHECK_INTERVAL=30
```

### 3. Run the Bot
```bash
python fetch_emails.py
```

## Important Notes

- ⚠️ **Never commit `.env` to version control** - it's already in `.gitignore`
- ✅ The `.env.example` file is safe to commit (no actual credentials)
- 🔐 For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password

## What Changed

### Security (v1.0)
- ❌ Removed `config.json` (credentials were exposed)
- ✅ Added `.env` for secure credential storage
- ✅ Added `.gitignore` to protect sensitive files
- ✅ Updated `fetch_emails.py` to use `python-dotenv`

### Resilience & Error Handling (v1.1)
- ✅ **Logging Framework** - All events logged to `bot.log`
- ✅ **Retry Logic** - Backend API calls retry up to 5 times with exponential backoff (2-20s)
- ✅ **Duplicate Detection** - Prevents processing the same email twice using Message-ID tracking
- ✅ **Enhanced Error Handling** - Comprehensive try-catch blocks with detailed error messages
- ✅ **Better Observability** - Track email processing, classification, and API calls

## Features

- 🔐 **Secure Configuration** - Environment variables for sensitive data
- 📝 **Comprehensive Logging** - All events logged to file with timestamps
- 🔄 **Automatic Retry** - Failed API calls automatically retry with backoff
- 🚫 **Duplicate Prevention** - Emails processed only once
- 📧 **Spam Monitoring** - Checks both inbox and spam folders for tickets
- 🤖 **AI Classification** - Zero-shot learning with BART-MNLI model
- 📬 **Auto-Reply** - Instant confirmation emails with ticket IDs
