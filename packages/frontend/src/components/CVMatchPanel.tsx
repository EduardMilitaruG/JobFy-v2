import type { Job } from "@jobfy/shared";
import { useCVMatch } from "../hooks/useCVMatch.js";
import { CVUploadForm } from "./CVUploadForm.js";
import { CVMatchResults } from "./CVMatchResults.js";

interface CVMatchPanelProps {
  jobs: Job[];
}

export function CVMatchPanel({ jobs }: CVMatchPanelProps) {
  const {
    file,
    setFile,
    loading,
    error,
    scoredJobs,
    analyzedCount,
    truncated,
    analyze,
    coverLetters,
    coverLetterLoading,
    getCoverLetter,
  } = useCVMatch(jobs);

  return (
    <div className="cv-match-section">
      <CVUploadForm
        file={file}
        onFileChange={setFile}
        onAnalyze={analyze}
        loading={loading}
        error={error}
        jobCount={jobs.length}
      />

      {scoredJobs && (
        <CVMatchResults
          jobs={scoredJobs}
          analyzedCount={analyzedCount}
          truncated={truncated}
          coverLetters={coverLetters}
          coverLetterLoading={coverLetterLoading}
          onGenerateCoverLetter={getCoverLetter}
        />
      )}
    </div>
  );
}
