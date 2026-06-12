import os
import json
import asyncio
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert resume writer, career coach, and ATS specialist with 15+ years of experience helping candidates land roles at top companies.

Your task is to tailor a candidate's resume to a specific job description (JD). You must:
1. Rewrite the professional summary/objective to directly address the JD's requirements and company context.
2. Highlight and reorder skills to surface the most JD-relevant ones first.
3. Rephrase experience bullets using keywords and action verbs from the JD, quantifying impact where possible.
4. Suggest missing keywords the candidate could add if they genuinely apply to their background.
5. Calculate a match score (0–100) reflecting how well the TAILORED resume aligns with the JD based on skills overlap, keyword density, and experience relevance.
6. Calculate an ATS score (0–100) for the tailored resume based on: keyword density, absence of tables/graphics/columns, standard section headings, consistent date formats, no headers/footers with critical info, and quantified achievements.
7. Write a professional cover letter (3–4 paragraphs) personalized to the JD and the candidate's actual experience.

Rules:
- NEVER fabricate experience, skills, or metrics the candidate does not have.
- Preserve the candidate's actual job titles, companies, and dates exactly.
- Output must be valid JSON only — no markdown fences, no preamble, no explanation outside the JSON.
- The customized resume should be significantly stronger and more targeted than the original.
- Scores must be integers between 0 and 100. Be honest — do not inflate scores.
- Be concise. Do not pad text unnecessarily.

Return a JSON object with this exact structure:
{
  "summary": "Rewritten professional summary (2-4 sentences)",
  "skills": {
    "highlighted": ["skill1", "skill2"],
    "all": ["skill1", "skill2"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "bullets": ["bullet 1", "bullet 2"]
    }
  ],
  "missing_keywords": ["keyword1", "keyword2"],
  "full_resume_text": "The complete tailored resume as plain readable text (suitable for copy-paste or download)",
  "match_score": 78,
  "match_score_reason": "2-3 sentence explanation of what drove the score up or down",
  "ats_score": 85,
  "ats_score_breakdown": {
    "keyword_density": 90,
    "standard_headings": 100,
    "date_formatting": 80,
    "quantified_achievements": 70,
    "no_complex_formatting": 100
  },
  "ats_tips": ["tip 1", "tip 2", "tip 3"],
  "cover_letter": "Full cover letter text, 3-4 paragraphs. Address it as 'Dear Hiring Manager,' and sign off with the candidate's name."
}

For full_resume_text: format it as a clean resume - Name/contact at top (preserve from original), then Summary, Skills, Experience, Education, Certifications.
Respond with ONLY the JSON object, nothing else.
"""


def _build_prompt(jd: str, resume_text: str) -> str:
    return f"""JOB DESCRIPTION:
{jd}

---

CANDIDATE'S CURRENT RESUME:
{resume_text}
"""


MODEL_NAME = "llama-3.3-70b-versatile"
MAX_RETRIES = 3
BASE_RETRY_DELAY = 5  # seconds


async def customize_resume(jd: str, resume_text: str) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured on the server.")

    client = Groq(api_key=api_key)
    prompt = _build_prompt(jd=jd, resume_text=resume_text)

    loop = asyncio.get_event_loop()

    last_error = None
    response = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.4,
                    max_tokens=3072,
                    response_format={"type": "json_object"},
                ),
            )
            break
        except Exception as e:
            last_error = e
            err_str = str(e).lower()
            if "rate" in err_str or "429" in err_str:
                logger.warning(f"Groq rate limit hit (attempt {attempt}/{MAX_RETRIES}): {e}")
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(BASE_RETRY_DELAY * attempt)
                    continue
                raise ValueError("Groq's rate limit was reached. Please wait a minute and try again.")
            else:
                logger.error(f"Groq API error: {e}")
                raise ValueError(f"AI service error: {str(e)[:200]}")

    if response is None:
        raise ValueError("Could not reach Groq. Please try again.") from last_error

    raw_text = response.choices[0].message.content.strip()

    # Strip any accidental markdown fences
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError("AI returned an unexpected response format. Please try again.")

    # Validate required keys
    required_keys = {
        "summary", "skills", "experience", "missing_keywords", "full_resume_text",
        "match_score", "match_score_reason",
        "ats_score", "ats_score_breakdown", "ats_tips",
        "cover_letter",
    }
    if not required_keys.issubset(data.keys()):
        raise ValueError("AI response was incomplete. Please try again.")

    return data