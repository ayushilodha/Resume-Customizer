# ResumeAI — AI-Powered Resume Customizer

A full-stack web app that tailors your resume to a specific job description using an LLM — rewriting your summary, highlighting matching skills, rephrasing experience bullets, and generating a match score, ATS score, and cover letter.

## Live Demo

- **Frontend:** https://resume-customizer-snowy.vercel.app/
- **Backend:** https://resume-customizer-z84m.onrender.com

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend  | Python, FastAPI, Uvicorn            |
| LLM      | Groq — Llama 3.3 70B Versatile (via `groq` Python SDK) |
| Hosting  | Vercel (frontend), Render (backend) |

---

## LLM Details

- **Provider:** [Groq](https://console.groq.com) (free tier)
- **Model:** `llama-3.3-70b-versatile`
- **Why:** Free API key, very fast inference (~2-5s responses), generous rate limits (30 RPM on free tier), strong JSON-mode output for structured responses
- **Output format:** Single LLM call returns structured JSON containing the tailored resume, match score, ATS score breakdown, missing keywords, and a generated cover letter

---

## Architecture

```
┌──────────────────────────────────┐
│        Next.js Frontend          │
│  - JD textarea (validated)       │
│  - PDF/DOCX file upload          │
│  - Tabbed result panel:          │
│    Resume / Scores / Cover Letter│
│  - Download as PDF / TXT         │
└────────────┬─────────────────────┘
             │ POST /api/customize (multipart/form-data)
┌────────────▼─────────────────────┐
│       FastAPI Backend            │
│  - File validation & parsing     │
│  - pdfplumber / python-docx      │
│  - Prompt engineering            │
│  - Groq API call (JSON mode)     │
│  - Retry logic on rate limits    │
│  - Response validation           │
└────────────┬─────────────────────┘
             │ REST
┌────────────▼─────────────────────┐
│   Groq — Llama 3.3 70B Versatile │
└──────────────────────────────────┘
```

---

## Features

### Core
- ✅ Paste job description with validation (min 50 characters)
- ✅ Upload PDF or DOCX resume (max 5MB), with drag-and-drop
- ✅ AI rewrites summary, highlights matching skills, rephrases experience bullets
- ✅ Shows missing keywords to consider adding
- ✅ Download tailored resume as PDF or plain text
- ✅ Error handling for invalid files, API failures, empty inputs, rate limits

### Bonus
- ✅ **Match Score** — 0-100 score with explanation of how well the tailored resume aligns with the JD
- ✅ **ATS Score** — 0-100 score with a 5-dimension breakdown (keyword density, standard headings, date formatting, quantified achievements, formatting complexity) plus actionable tips
- ✅ **Cover Letter Generator** — personalized 3-4 paragraph cover letter, copyable and downloadable

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Groq API key → [Get one free at console.groq.com/keys](https://console.groq.com/keys)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your GROQ_API_KEY

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Health check: `GET /health`

### Frontend

```bash
cd frontend
npm install

cp .env.example .env.local
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → connect your repo
3. Set root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `GROQ_API_KEY` = your key
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set root directory: `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-api.onrender.com`
4. Deploy

---

## Known Limitations

- Scanned (image-only) PDFs cannot be parsed — text must be selectable
- LLM occasionally returns generic bullets if the original resume is very sparse
- Groq free tier has rate limits (~30 RPM) — backend retries automatically with exponential backoff, but heavy concurrent use may still hit limits
- No persistent storage — results are session-only, not saved between visits
- Render free tier spins down after inactivity; first request after idle may take ~30s

---

## Folder Structure

```
resume-customizer/
├── backend/
│   ├── main.py          # FastAPI app, routes, validation
│   ├── parser.py         # PDF + DOCX text extraction
│   ├── llm.py            # Groq integration + prompt engineering
│   ├── requirements.txt
│   ├── render.yaml       # Render deployment config
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx       # Main page
    │   └── globals.css
    ├── components/
    │   ├── FileUpload.tsx
    │   ├── ResultPanel.tsx  # Tabbed results: Resume / Scores / Cover Letter
    │   └── Spinner.tsx
    ├── lib/
    │   ├── api.ts         # API client
    │   ├── download.ts    # PDF + text download
    │   ├── types.ts        # TypeScript types
    │   └── utils.ts
    └── .env.example
```
