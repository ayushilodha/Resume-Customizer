import { CustomizeResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function customizeResume(
  jobDescription: string,
  resumeFile: File
): Promise<CustomizeResult> {
  const formData = new FormData();
  formData.append("job_description", jobDescription);
  formData.append("resume", resumeFile);

  const res = await fetch(`${API_URL}/api/customize`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const err = await res.json();
      message = err.detail || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
