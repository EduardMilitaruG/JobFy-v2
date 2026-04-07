import { useRef } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";

interface CVUploadFormProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
  jobCount: number;
}

export function CVUploadForm({
  file,
  onFileChange,
  onAnalyze,
  loading,
  error,
  jobCount,
}: CVUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const noJobs = jobCount === 0;

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
          <label
            htmlFor="cv-file-input"
            className={`file-upload-label ${file ? "has-file" : ""}`}
          >
            {file ? (
              <>
                <FileText size={18} />
                <span>{file.name}</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Click to upload your CV (PDF)</span>
              </>
            )}
          </label>

          <div className="cv-job-count">
            Matching against <strong>{jobCount}</strong> job
            {jobCount !== 1 ? "s" : ""}
          </div>

          <button
            onClick={onAnalyze}
            disabled={!file || loading}
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
