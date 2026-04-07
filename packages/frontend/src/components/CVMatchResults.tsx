import { useState } from "react";
import type { ScoredJob } from "../hooks/useCVMatch.js";
import { CVMatchRow } from "./CVMatchRow.js";

interface CVMatchResultsProps {
  jobs: ScoredJob[];
  analyzedCount: number;
  truncated: boolean;
  coverLetters: Map<number, string>;
  coverLetterLoading: Set<number>;
  onGenerateCoverLetter: (jobId: number) => void;
}

export function CVMatchResults({
  jobs,
  analyzedCount,
  truncated,
  coverLetters,
  coverLetterLoading,
  onGenerateCoverLetter,
}: CVMatchResultsProps) {
  const [minScore, setMinScore] = useState(0);

  const filtered = jobs.filter((j) => j.score >= minScore);

  return (
    <div className="cv-match-results">
      <div className="cv-results-header">
        <div className="cv-results-meta">
          <span>
            <strong>{filtered.length}</strong> matches
            {minScore > 0 && ` above ${minScore}%`}
            {" · "}analyzed <strong>{analyzedCount}</strong> jobs
          </span>
          {truncated && (
            <span className="cv-truncated-notice">
              ⚠ Only your 80 most recent jobs were analyzed
            </span>
          )}
        </div>

        <div className="cv-score-filter">
          <label htmlFor="score-slider" className="score-slider-label">
            Min score: <strong>{minScore}%</strong>
          </label>
          <input
            id="score-slider"
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="score-slider"
            aria-label="Minimum match score filter"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="cv-no-matches">
          No jobs match {minScore}%+ — try lowering the score filter.
        </div>
      ) : (
        <div className="match-results-list">
          {filtered.map((job) => (
            <CVMatchRow
              key={job.id}
              job={job}
              coverLetter={coverLetters.get(job.id)}
              coverLetterLoading={coverLetterLoading.has(job.id)}
              onGenerateCoverLetter={onGenerateCoverLetter}
            />
          ))}
        </div>
      )}
    </div>
  );
}
