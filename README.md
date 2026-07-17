# Startup Navigator – Comprehensive Guide to Startups

Your AI-powered guide to building successful startups. Leverage verified databases, templates, and dynamic RAG chat assistance.

---

## Technical Architecture

This application consists of:
1. **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, Framer Motion, and TanStack Query.
2. **Backend**: FastAPI (Python), SQLAlchemy, Pydantic, and JWT-based authentication.
3. **Database**: PostgreSQL (managed via pgAdmin or command line) for storing users, chat logs, search histories, bookmarks, feedback, and document embedding records.
4. **AI & RAG**: Google Gemini API (or OpenAI GPT-4o alternative) for LLM prompting and semantic vector indexing, with a deterministic custom mathematical fallback vector-indexing system.

---

## Folder Layout

```
.
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, articles, chat, etc.)
│   │   ├── services/     # RAG chunking & vector search services
│   │   ├── config.py     # Configuration & environment loader
│   │   ├── database.py   # Connection factory (PostgreSQL)
│   │   ├── models.py     # SQLAlchemy DB schemas
│   │   ├── schemas.py    # Pydantic input validators
│   │   ├── security.py   # BCrypt encryption & JWT encoders
│   │   └── seed.py       # Seed script (registers articles & users)
│   ├── requirements.txt  # Python requirements list
│   └── .env              # Environment configurations (Postgres credentials)
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js 15 App router screens
│   │   ├── components/   # Shared layout elements (Navbar, Footer, Providers)
│   │   ├── hooks/        # React session helper contexts (useAuth)
│   │   └── services/     # Axios client configuration
│   ├── package.json      # Node scripts & packages list
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.local        # Frontend environment parameters
└── README.md
```

---

## Seeding & Default Credentials

Seeding creates default test users and pre-loads the database tables with high-quality articles, accelerators links, and pre-computed embeddings.

*   **Administrator Account**:
    *   **Email**: `admin@startupnav.com`
    *   **Password**: `AdminPass123!`
*   **Standard User Account**:
    *   **Email**: `user@startupnav.com`
    *   **Password**: `UserPass123!`

---

## Getting Started: Local PostgreSQL Local Setup (No Docker)

To run the application locally, connect to your PostgreSQL database (created or monitored via **pgAdmin**) and start the servers:

### 1. Database Creation
1. Open **pgAdmin** (or PostgreSQL shell).
2. Create a new database named: `startup_navigator`.
3. Set your connection string in [backend/.env](file:///c:/Users/Mahesh%20Porla/Downloads/task_application/backend/.env):
   ```env
   DATABASE_URL=postgresql://your_user:your_password@localhost:5432/startup_navigator
   ```

### 2. Set Up and Run the Backend
1. Open a terminal in the project directory.
2. Activate your virtual environment:
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Run the database seed script to initialize schemas and default articles inside PostgreSQL:
   ```bash
   python backend/app/seed.py
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```

### 3. Set Up and Run the Frontend
1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Next.js local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.
