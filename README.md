# Yantrodharaka

Yantrodharaka is a full-stack educational platform for managing courses, learning materials, events, student enquiries, notifications, and payments.

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **Authentication:** JWT-based authentication
- **Storage:** Local uploads, with optional S3-compatible storage

## Features

- Course and event information
- Learning materials and notifications
- Contact and student enquiry forms
- Payment-related workflows
- Admin dashboard and protected admin pages
- REST API built with FastAPI

## Project Structure

```text
Yantrodharaka/
├── frontend/       # React + Vite application
└── backend/        # FastAPI application and API routes
```

## Prerequisites

Install the following before running the project:

- Python 3.10 or newer
- Node.js and npm
- PostgreSQL

## Setup and Run

### 1. Backend

Open a terminal in the project root:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

**Windows PowerShell**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local environment file from the example:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux**
```bash
cp .env.example .env
```

Edit `backend/.env` with your local PostgreSQL connection string and a strong, unique JWT secret. Configure the initial admin credentials securely before running the application.

Start the API:

```bash
uvicorn app.main:app --reload
```

API base URL: `http://localhost:8000`  
Interactive API documentation: `http://localhost:8000/docs`

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux**
```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` in `frontend/.env` to the backend URL, then start the development server:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal, usually `http://localhost:5173`.

## Environment Variables

Review the `.env.example` files in both `backend/` and `frontend/`. Use your own local values. Never commit `.env` files, passwords, tokens, private keys, or cloud credentials.

## Push to GitHub

Run these commands from the project root after checking `.gitignore` and removing secrets and generated dependencies from the files to be committed:

```bash
git init
git add .
git status
git commit -m "Initial commit: Yantrodharaka platform"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example GitHub URL with your repository URL. If Git is already initialized or a remote already exists, do not repeat the corresponding setup command.

## Security Notes

- Do not upload `.env` files or real credentials.
- Do not commit `frontend/node_modules/`, `backend/.venv/`, Python cache files, or generated build files unless there is a specific reason.
- Change all example passwords and secrets before deployment.
- Configure database access, CORS, and storage credentials for your environment.

## License

Add a license file if you intend to distribute or reuse this project publicly.
