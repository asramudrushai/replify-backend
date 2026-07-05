# Replify Backend

AI-powered customer service chatbot backend for small businesses.

## Tech Stack
- Node.js & Express
- SQLite (via team-db Turso sync)
- JWT for authentication
- Bcryptjs for password hashing

## Directory Structure
- `src/index.js`: Entry point
- `src/db.js`: Database utility wrapping `team-db` CLI
- `src/middleware/auth.js`: JWT authentication middleware
- `src/routes/`: API route handlers
- `src/utils/faqMatcher.js`: Simple keyword-based FAQ matching logic

## API Endpoints

### Auth
- `POST /api/auth/register`: Register a new business
- `POST /api/auth/login`: Login and receive JWT

### FAQs (Requires Auth)
- `GET /api/faqs`: List all FAQs for the business
- `POST /api/faqs`: Create a new FAQ
- `DELETE /api/faqs/:id`: Delete an FAQ

### Chat
- `GET /api/chat/:businessId/answer?question=...`: Get AI response for a question
- `POST /api/chat/session`: Create a new chat session

### Leads
- `POST /api/leads`: Capture customer lead (name, email)
- `GET /api/leads`: Retrieve leads for the business (Requires Auth)

### Business Profile (Requires Auth)
- `GET /api/business/profile`: Get business profile info
- `POST /api/business/profile`: Update business profile

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the server:
   ```bash
   npm start
   ```

The server binds to `0.0.0.0` and listens on port `3001` by default.
