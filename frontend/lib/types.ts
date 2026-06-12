export interface SkillsData {
  highlighted: string[];
  all: string[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}

export interface AtsBreakdown {
  keyword_density: number;
  standard_headings: number;
  date_formatting: number;
  quantified_achievements: number;
  no_complex_formatting: number;
}

export interface CustomizeResult {
  summary: string;
  skills: SkillsData;
  experience: ExperienceItem[];
  missing_keywords: string[];
  full_resume_text: string;
  match_score: number;
  match_score_reason: string;
  ats_score: number;
  ats_score_breakdown: AtsBreakdown;
  ats_tips: string[];
  cover_letter: string;
}

export type AppState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: CustomizeResult }
  | { status: "error"; message: string };
