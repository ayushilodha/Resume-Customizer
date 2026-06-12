"use client";

import { useState } from "react";
import {
  Download, ChevronDown, ChevronUp, Sparkles, AlertCircle,
  Target, Shield, FileText, Copy, Check
} from "lucide-react";
import { CustomizeResult, AtsBreakdown } from "@/lib/types";
import { downloadAsPdf, downloadAsText } from "@/lib/download";
import { cn } from "@/lib/utils";

interface Props {
  data: CustomizeResult;
}

type Tab = "resume" | "scores" | "cover_letter";

export default function ResultPanel({ data }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [showMissing, setShowMissing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      await downloadAsPdf(data.full_resume_text);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyCoverLetter() {
    await navigator.clipboard.writeText(data.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-600" />
          <h2 className="text-lg font-semibold text-ink">Results</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadAsText(data.full_resume_text)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            .txt
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            <Download size={14} />
            {downloading ? "Generating…" : "PDF"}
          </button>
        </div>
      </div>

      {/* Score pills */}
      <div className="grid grid-cols-2 gap-3">
        <ScorePill
          label="JD Match"
          score={data.match_score}
          icon={<Target size={14} />}
          onClick={() => setActiveTab("scores")}
        />
        <ScorePill
          label="ATS Score"
          score={data.ats_score}
          icon={<Shield size={14} />}
          onClick={() => setActiveTab("scores")}
        />
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-1 gap-1">
        {(["resume", "scores", "cover_letter"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-medium transition-all",
              activeTab === tab
                ? "bg-white text-ink shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {tab === "resume" ? "Tailored Resume" : tab === "scores" ? "Score Breakdown" : "Cover Letter"}
          </button>
        ))}
      </div>

      {/* Tab: Resume */}
      {activeTab === "resume" && (
        <div className="space-y-4">
          <Section title="Professional Summary">
            <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
          </Section>

          <Section title="Top Matching Skills">
            <div className="flex flex-wrap gap-2">
              {data.skills.highlighted.map((s) => (
                <span key={s} className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                  {s}
                </span>
              ))}
            </div>
            {data.skills.all.length > data.skills.highlighted.length && (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.skills.all
                  .filter((s) => !data.skills.highlighted.includes(s))
                  .map((s) => (
                    <span key={s} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {s}
                    </span>
                  ))}
              </div>
            )}
          </Section>

          <Section title="Experience">
            <div className="space-y-5">
              {data.experience.map((job, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{job.title}</p>
                      <p className="text-xs text-gray-500">{job.company}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{job.duration}</span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {job.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2 text-sm text-gray-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {data.missing_keywords.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <button
                onClick={() => setShowMissing(!showMissing)}
                className="flex w-full items-center justify-between text-sm font-medium text-amber-800"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle size={15} />
                  {data.missing_keywords.length} suggested keywords to consider adding
                </span>
                {showMissing ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {showMissing && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.missing_keywords.map((k) => (
                    <span key={k} className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700">
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <Section title="Full Resume Text">
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-700 max-h-72 overflow-y-auto">
              {data.full_resume_text}
            </pre>
          </Section>
        </div>
      )}

      {/* Tab: Scores */}
      {activeTab === "scores" && (
        <div className="space-y-4">
          {/* Match Score */}
          <Section title="JD Match Score">
            <div className="mb-3 flex items-end gap-3">
              <span className={cn("text-4xl font-bold", scoreColor(data.match_score))}>
                {data.match_score}
              </span>
              <span className="mb-1 text-sm text-gray-400">/ 100</span>
              <span className={cn("mb-1 ml-auto text-xs font-semibold px-2 py-1 rounded-full", scoreBadge(data.match_score))}>
                {scoreLabel(data.match_score)}
              </span>
            </div>
            <ScoreBar value={data.match_score} />
            <p className="mt-3 text-xs leading-relaxed text-gray-600">{data.match_score_reason}</p>
          </Section>

          {/* ATS Score */}
          <Section title="ATS Score">
            <div className="mb-3 flex items-end gap-3">
              <span className={cn("text-4xl font-bold", scoreColor(data.ats_score))}>
                {data.ats_score}
              </span>
              <span className="mb-1 text-sm text-gray-400">/ 100</span>
              <span className={cn("mb-1 ml-auto text-xs font-semibold px-2 py-1 rounded-full", scoreBadge(data.ats_score))}>
                {scoreLabel(data.ats_score)}
              </span>
            </div>
            <ScoreBar value={data.ats_score} />

            {/* Breakdown */}
            <div className="mt-4 space-y-2.5">
              {Object.entries(data.ats_score_breakdown).map(([key, val]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className={cn("font-medium", scoreColor(val))}>{val}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className={cn("h-1.5 rounded-full transition-all", scoreBarColor(val))}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ATS Tips */}
            {data.ats_tips.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Tips to improve</p>
                <ul className="space-y-1.5">
                  {data.ats_tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-600">
                      <span className="mt-0.5 text-brand-500">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        </div>
      )}

      {/* Tab: Cover Letter */}
      {activeTab === "cover_letter" && (
        <Section title="Cover Letter">
          <div className="flex justify-end mb-3">
            <button
              onClick={handleCopyCoverLetter}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 max-h-96 overflow-y-auto">
            {data.cover_letter}
          </div>
          <button
            onClick={() => downloadAsText(data.cover_letter, "cover-letter.txt")}
            className="mt-3 flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
          >
            <FileText size={13} />
            Download as .txt
          </button>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
      {children}
    </div>
  );
}

function ScorePill({
  label, score, icon, onClick,
}: {
  label: string; score: number; icon: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:border-brand-200 transition-colors w-full text-left"
    >
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", scoreIconBg(score))}>
        <span className={scoreColor(score)}>{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={cn("text-xl font-bold leading-tight", scoreColor(score))}>{score}<span className="text-xs font-normal text-gray-400">/100</span></p>
      </div>
    </button>
  );
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div
        className={cn("h-2 rounded-full transition-all duration-500", scoreBarColor(value))}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function scoreColor(n: number) {
  if (n >= 75) return "text-emerald-600";
  if (n >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreBarColor(n: number) {
  if (n >= 75) return "bg-emerald-500";
  if (n >= 50) return "bg-amber-400";
  return "bg-red-400";
}

function scoreIconBg(n: number) {
  if (n >= 75) return "bg-emerald-50";
  if (n >= 50) return "bg-amber-50";
  return "bg-red-50";
}

function scoreBadge(n: number) {
  if (n >= 75) return "bg-emerald-50 text-emerald-700";
  if (n >= 50) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function scoreLabel(n: number) {
  if (n >= 85) return "Excellent";
  if (n >= 70) return "Good";
  if (n >= 50) return "Fair";
  return "Needs Work";
}
