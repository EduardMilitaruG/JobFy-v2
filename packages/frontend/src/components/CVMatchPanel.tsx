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
    resumeFileName,
    loading,
    error,
    scoredJobs,
    analyzedCount,
    truncated,
    analyze,
    canAnalyze,
    clearResume,
    coverLetters,
    coverLetterLoading,
    getCoverLetter,
    regenerateCoverLetter,
  } = useCVMatch(jobs);

  return (
    <div className="cv-match-section">
      <CVUploadForm
        file={file}
        resumeFileName={resumeFileName}
        onFileChange={setFile}
        onAnalyze={analyze}
        onClear={clearResume}
        loading={loading}
        error={error}
        jobCount={jobs.length}
        canAnalyze={canAnalyze}
      />

      {scoredJobs && (
        <CVMatchResults
          jobs={scoredJobs}
          analyzedCount={analyzedCount}
          truncated={truncated}
          coverLetters={coverLetters}
          coverLetterLoading={coverLetterLoading}
          onGenerateCoverLetter={getCoverLetter}
          onRegenerateCoverLetter={regenerateCoverLetter}
        />
      )}
    </div>
  );
}
