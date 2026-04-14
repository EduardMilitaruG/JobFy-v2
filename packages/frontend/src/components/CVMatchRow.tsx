import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText, Loader2, Copy, Check } from "lucide-react";
import type { ScoredJob } from "../hooks/useCVMatch.js";

interface CVMatchRowProps {
  job: ScoredJob;
  coverLetter: string | undefined;
  coverLetterLoading: boolean;
  onGenerateCoverLetter: (jobId: number) => void;
  onRegenerateCoverLetter: (jobId: number) => void;
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 80 ? "score-high" : score >= 50 ? "score-mid" : "score-low";
  return <div className={`score-badge ${cls}`}>{score}</div>;
}

export function CVMatchRow({
  job,
  coverLetter,
  coverLetterLoading,
  onGenerateCoverLetter,
  onRegenerateCoverLetter,
}: CVMatchRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="match-row">
      <div
        className="match-row-header"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <ScoreBadge score={job.score} />

        <div className="match-row-info">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="match-job-title"
            onClick={(e) => e.stopPropagation()}
          >
            {job.jobTitle}
            <ExternalLink size={12} />
          </a>
          <span className="match-job-meta">
            {job.company} · {job.location}
          </span>
        </div>

        <span
          className={`source-badge source-${job.source.toLowerCase().replace(/\s/g, "")}`}
        >
          {job.source}
        </span>

        {expanded ? <ChevronUp size={16} className="match-chevron" /> : <ChevronDown size={16} className="match-chevron" />}
      </div>

      {expanded && (
        <div className="match-row-detail">
          <p className="match-reason">{job.reason}</p>

          {job.missingSkills.length > 0 && (
            <div className="missing-skills">
              <span className="missing-skills-label">Missing skills:</span>
              {job.missingSkills.map((skill) => (
                <span key={skill} className="missing-skill">
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="cover-letter-section">
            {!coverLetter && (
              <button
                className="btn btn-sm cover-letter-btn"
                onClick={() => onGenerateCoverLetter(job.id)}
                disabled={coverLetterLoading}
              >
                {coverLetterLoading ? (
                  <>
                    <Loader2 size={13} className="spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText size={13} />
                    Generate Cover Letter
                  </>
                )}
              </button>
            )}

            {coverLetter && (
              <div className="cover-letter-result">
                <div className="cover-letter-header">
                  <span className="cover-letter-title">Cover Letter</span>
                  <div className="cover-letter-actions">
                    <button
                      className="btn btn-sm"
                      onClick={() => onRegenerateCoverLetter(job.id)}
                      disabled={coverLetterLoading}
                      title="Regenerate"
                    >
                      {coverLetterLoading ? <Loader2 size={13} className="spin" /> : "↺ Regenerate"}
                    </button>
                    <button className="btn btn-sm" onClick={handleCopy} title="Copy to clipboard">
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <pre className="cover-letter-text">{coverLetter}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
