import type { CVMatchResponse, CoverLetterResponse } from "@jobfy/shared";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export async function matchCV(
  file: File,
  jobIds: number[],
): Promise<CVMatchResponse & { resumeText: string }> {
  const form = new FormData();
  form.append("resume", file);
  form.append("jobIds", JSON.stringify(jobIds));

  const res = await fetch(`${BASE_URL}/api/cv-match`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function matchCVFromText(
  resumeText: string,
  jobIds: number[],
): Promise<CVMatchResponse & { resumeText: string }> {
  const res = await fetch(`${BASE_URL}/api/cv-match/from-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobIds }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function generateCoverLetter(
  resumeText: string,
  jobId: number,
): Promise<CoverLetterResponse> {
  const res = await fetch(`${BASE_URL}/api/cv-match/cover-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobId }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}
