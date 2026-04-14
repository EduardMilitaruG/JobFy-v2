import { useRef } from "react";
import { Upload, FileText, Loader2, Sparkles, X } from "lucide-react";

interface CVUploadFormProps {
  file: File | null;
  resumeFileName: string;
  onFileChange: (file: File | null) => void;
  onAnalyze: () => void;
  onClear: () => void;
  loading: boolean;
  error: string | null;
  jobCount: number;
  canAnalyze: boolean;
}

export function CVUploadForm({
  file,
  resumeFileName,
  onFileChange,
  onAnalyze,
  onClear,
  loading,
  error,
  jobCount,
  canAnalyze,
}: CVUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const noJobs = jobCount === 0;

  // What to show in the file label
  const displayName = file?.name ?? resumeFileName;
  const hasResume = !!displayName;

  return (
    <div className="cv-upload-card">
      <div className="cv-upload-header">
        <Sparkles size={20} className="cv-icon" />
        <h3>AI CV Matcher</h3>
      </div>

      <p className="cv-upload-description">
        Upload your CV and Claude will score each job based on how well your
        skills and experience match.
      </p>

      {noJobs ? (
        <div className="cv-empty-jobs" role="status">
          No jobs to match yet — head to the{" "}
          <strong>Scrape tab</strong> to fetch some first.
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            id="cv-file-input"
            type="file"
            accept=".pdf"
            className="file-upload-input"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            aria-label="Upload CV PDF"
          />

          <div className="file-upload-row">
            <label
              htmlFor="cv-file-input"
              className={`file-upload-label ${hasResume ? "has-file" : ""}`}
            >
              {hasResume ? (
                <>
                  <FileText size={18} />
                  <span>
                    {file ? displayName : `Previously used: ${displayName}`}
                  </span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Click to upload your CV (PDF)</span>
                </>
              )}
            </label>

            {hasResume && (
              <button
                type="button"
                className="btn btn-sm cv-clear-btn"
                onClick={onClear}
                title="Clear CV"
                aria-label="Clear saved CV"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="cv-job-count">
            Matching against <strong>{jobCount}</strong> job
            {jobCount !== 1 ? "s" : ""}
          </div>

          <button
            onClick={onAnalyze}
            disabled={!canAnalyze}
            className="btn btn-primary cv-analyze-btn"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Analyze with AI
              </>
            )}
          </button>
        </>
      )}

      {error && (
        <div className="message error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
