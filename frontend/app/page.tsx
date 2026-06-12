"use client";

import { useState } from "react";
import { Wand2, Github } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ResultPanel from "@/components/ResultPanel";
import Spinner from "@/components/Spinner";
import { customizeResume } from "@/lib/api";
import { AppState } from "@/lib/types";

const MIN_JD_LENGTH = 50;

export default function Home() {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<AppState>({ status: "idle" });

  const jdError = jd.length > 0 && jd.length < MIN_JD_LENGTH
    ? `Too short — paste the full job description (${jd.length}/${MIN_JD_LENGTH} chars minimum).`
    : null;

  const canSubmit =
    jd.trim().length >= MIN_JD_LENGTH &&
    file !== null &&
    state.status !== "loading";

  async function handleSubmit() {
    if (!canSubmit || !file) return;
    setState({ status: "loading" });
    try {
      const data = await customizeResume(jd, file);
      setState({ status: "success", data });
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      setState({ status: "error", message: err.message || "Something went wrong." });
    }
  }

  function handleReset() {
    setState({ status: "idle" });
  }

  function handleClearAll() {
    setJd("");
    setFile(null);
    setState({ status: "idle" });
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Wand2 size={16} className="text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-ink">ResumeAI</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-14 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
            <Wand2 size={11} />
            Powered by Llama 3.3 (Groq)
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink">
            Your resume,{" "}
            <span className="text-brand-600">tailored to the role</span>
          </h1>
          <p className="mt-4 text-base text-gray-500">
            Paste a job description. Upload your resume. Get a targeted version
            with matched skills, rewritten bullets, and keyword suggestions — in seconds.
          </p>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Your Input
            </h2>

            <div className="space-y-5">
              {/* JD */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Job Description
                </label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  disabled={state.status === "loading"}
                  placeholder="Paste the full job description here — role overview, responsibilities, and requirements…"
                  rows={10}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-ink placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 transition-colors"
                />
                {jdError && (
                  <p className="mt-1 text-xs text-red-500">{jdError}</p>
                )}
                <p className="mt-1 text-right text-xs text-gray-400">{jd.length} characters</p>
              </div>

              {/* Resume upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Your Resume
                </label>
                <FileUpload
                  file={file}
                  onChange={setFile}
                  disabled={state.status === "loading"}
                />
              </div>

              {/* Error */}
              {state.status === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <strong>Error:</strong> {state.message}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Wand2 size={16} />
                Tailor My Resume
              </button>
            </div>
          </div>

          {/* Output card */}
          <div id="result" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {state.status === "idle" && (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                  <Wand2 size={24} className="text-brand-500" />
                </div>
                <p className="text-sm font-medium text-gray-500">Your tailored resume will appear here</p>
                <p className="mt-1 text-xs text-gray-400">Fill in the form on the left to get started</p>
              </div>
            )}

            {state.status === "loading" && <Spinner />}

            {state.status === "error" && (
              <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                <p className="text-sm text-gray-400">Fix the error and try again.</p>
                <button
                  onClick={handleReset}
                  className="mt-3 text-xs text-brand-600 underline underline-offset-2"
                >
                  Reset
                </button>
              </div>
            )}

            {state.status === "success" && (
              <>
                <ResultPanel data={state.data} />
                {/* <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={handleReset}
                    className="text-xs text-gray-400 underline underline-offset-2 hover:text-blue-600"
                  >
                    ← Back to edit
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-gray-400 underline underline-offset-2 hover:text-red-500"
                  >
                    Start fresh
                  </button>
                </div> */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:border-blue-300"
                  >
                    ✏️ Edit Resume
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:border-red-300"
                  >
                    🗑️ Start Fresh
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
