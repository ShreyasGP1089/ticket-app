// config.js
// Exports the API base URL.
// Priority:
// 1. process.env.REACT_APP_API_URL (if set in .env.production or deployment vars)
// 2. Default hardcoded fallback for local development: 'http://localhost:8080'

export const API_BASE_URL = process.env.REACT_APP_API_URL;
if (!API_BASE_URL) {
    console.error("REACT_APP_API_URL is not defined in the environment variables.");
}
