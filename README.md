# ResumeAI — AI-Powered Resume Customizer

A full-stack web app that tailors your resume to a specific job description using Gemini AI.

## Live Demo

- **Frontend:** https://your-app.vercel.app _(update after deploy)_
- **Backend:** https://your-api.onrender.com _(update after deploy)_

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend  | Python, FastAPI, Uvicorn            |
| LLM      | Google Gemini 1.5 Flash (via `google-generativeai`) |
| Hosting  | Vercel (frontend), Render (backend) |

---

## LLM Details

- **Provider:** Google AI Studio (free tier)
- **Model:** `gemini-1.5-flash`
- **Why:** Free API key, generous rate limits, strong instruction-following

---

## Architecture

```
┌──────────────────────────────────┐
│        Next.js Frontend          │
│  - JD textarea (validated)       │
│  - PDF/DOCX file upload          │
│  - Result panel + download       │
└────────────┬─────────────────────┘
             │ POST /api/customize (multipart/form-data)
┌────────────▼─────────────────────┐
│       FastAPI Backend            │
│  - File validation & parsing     │
│  - pdfplumber / python-docx      │
│  - Prompt engineering            │
│  - Gemini API call               │
│  - JSON response formatting      │
└────────────┬─────────────────────┘
             │ REST
┌────────────▼─────────────────────┐
│       Gemini 1.5 Flash           │
└──────────────────────────────────┘
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Gemini API key → [Get one free at Google AI Studio](https://aistudio.google.com/app/apikey)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

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
   - `GEMINI_API_KEY` = your key
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import repo
2. Set root directory: `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-api.onrender.com`
4. Deploy

---

## Features

- ✅ Paste job description with validation
- ✅ Upload PDF or DOCX resume (max 5MB)
- ✅ AI rewrites summary, highlights matching skills, rephrases experience bullets
- ✅ Shows missing keywords to consider adding
- ✅ Download tailored resume as PDF or plain text
- ✅ Error handling for invalid files, API failures, empty inputs

---

## Known Limitations

- Scanned (image-only) PDFs cannot be parsed — text must be selectable
- LLM occasionally returns generic bullets if the original resume is very sparse
- Gemini free tier has rate limits (~15 RPM) — fine for demo/interview use
- No persistent storage — results are session-only

---

## Folder Structure

```
resume-customizer/
├── backend/
│   ├── main.py          # FastAPI app, routes, validation
│   ├── parser.py        # PDF + DOCX text extraction
│   ├── llm.py           # Gemini integration + prompt
│   ├── requirements.txt
│   ├── render.yaml      # Render deployment config
│   └── .env.example
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx     # Main page
    │   └── globals.css
    ├── components/
    │   ├── FileUpload.tsx
    │   ├── ResultPanel.tsx
    │   └── Spinner.tsx
    ├── lib/
    │   ├── api.ts       # API client
    │   ├── download.ts  # PDF + text download
    │   ├── types.ts     # TypeScript types
    │   └── utils.ts
    └── .env.example
```
