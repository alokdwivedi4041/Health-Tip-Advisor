# MindBot – AI-Powered Health Tips Advisor

MindBot is a full-stack web application that provides users with general health and wellness tips through an AI-powered chatbot. Users can register, log in, chat with the assistant, revisit past conversations, use quick-reply suggestions, and rate AI responses. An admin dashboard provides usage analytics.

> **Note:** MindBot gives general educational health information only. It is **not** a diagnostic tool and does not replace professional medical advice.

---

## Features

**User**
- Secure registration and login (JWT-based authentication)
- Persistent chat sessions — create new chats or revisit old ones
- AI-generated health & wellness tips with conversation context
- Quick-reply suggestion buttons
- Typing indicator while the AI responds
- 👍 / 👎 feedback on AI responses
- Secure logout

**Admin**
- Total users, sessions, and messages
- Positive/negative feedback counts and average rating
- Most common user topics
- Restricted to a designated admin account

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Axios, React Router |
| Backend | Python, FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT (python-jose), bcrypt (passlib) |
| AI | Groq API (Llama 3.3 70B) |

---

## Architecture

```
React Frontend (Vite, :5173)
        |  Axios + JWT in Authorization header
        v
FastAPI Backend (Uvicorn, :8000)
  routers: auth, session, chat, feedback, admin
  services: ai_service.py
        |                    |
        v                    v
PostgreSQL              Groq LLM API
(users, sessions,       (health-domain
 messages, feedback)     system prompt)
```

**Chat flow:** frontend sends message → backend saves it → backend loads recent history → AI service calls Groq with a health-focused system prompt → AI reply is saved → both messages returned to frontend.

---

## Folder Structure

```
MindBot-Health-Advisor/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/        # user, session, message, feedback
│   │   ├── schemas/       # Pydantic request/response models
│   │   ├── routers/       # auth, session, chat, feedback, admin
│   │   ├── services/      # ai_service.py
│   │   └── utils/         # security.py, dependencies.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/    # Navbar, QuickReplies
│       ├── pages/         # Register, Login, Chat, Admin
│       └── services/      # api.js
├── .gitignore
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js (LTS)
- PostgreSQL
- A free Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/alokdwivedi4041/Health-Tip-Advisor.git
cd Health-Tip-Advisor
```

### 2. Database setup
```bash
psql -U postgres
CREATE DATABASE mindbot_db;
\q
```
Tables are created automatically the first time the backend starts.

### 3. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1      # Windows PowerShell
pip install -r requirements.txt
```
Create a `.env` file in `backend/` (copy `.env.example`) and fill in real values:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mindbot_db
JWT_SECRET=your_random_secret
GROQ_API_KEY=your_groq_api_key
ADMIN_EMAIL=your_admin_email@example.com
```
Run the server:
```bash
uvicorn app.main:app --reload
```
Backend runs at `http://127.0.0.1:8000` — Swagger docs at `/docs`.

### 4. Frontend setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/` (copy `.env.example`):
```
VITE_API_URL=http://127.0.0.1:8000
```
Run the dev server:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create a new account | No |
| POST | `/login` | Log in, receive a JWT | No |
| GET | `/me` | Get current user's profile | Yes |
| POST | `/session` | Start a new chat session | Yes |
| GET | `/sessions` | List your chat sessions | Yes |
| GET | `/history/{session_id}` | Get messages in a session | Yes |
| POST | `/chat` | Send a message, get an AI reply | Yes |
| POST | `/feedback` | Rate an AI message (👍/👎) | Yes |
| GET | `/admin/stats` | Usage statistics | Yes (Admin) |
| GET | `/admin/topics` | Most common topics | Yes (Admin) |

---

## Security

- Passwords hashed with bcrypt — never stored in plain text
- JWT-based auth, 24-hour token expiry
- Ownership checks on every session/message/feedback query
- Admin routes restricted by email check
- CORS restricted to the known frontend origin
- Secrets kept in `.env`, excluded from Git via `.gitignore`

---

## Testing

The app was manually tested end-to-end via FastAPI's Swagger UI (backend) and the browser (frontend), covering happy paths plus edge cases: duplicate registration, wrong passwords, missing/invalid tokens, empty messages, cross-user data access attempts, invalid feedback ratings, and admin access control.

---

## Screenshots

_Add screenshots here: Login page, Chat with AI response, Quick replies, Feedback buttons, Admin dashboard._

---

## Future Improvements

- Move admin role into the database instead of an `.env` email check
- Add refresh tokens
- Password reset via email
- NLP-based topic clustering for analytics
- Pagination for long chat histories
- Automated tests (pytest, React Testing Library)
- Persistent production deployment (Render + Vercel)

---

## Author

ALOK DWIVEDI — HEALTH-TIP-ADVISOR
