import { useState } from "react";
import { createPortal } from "react-dom";
import { Building2, MapPin, ExternalLink, Trash2 } from "lucide-react";
import type { Job } from "@jobfy/shared";
import { ConfirmDialog } from "./ConfirmDialog.js";

interface JobRowProps {
  job: Job;
  onDelete: (id: number) => void;
}

export function JobRow({ job, onDelete }: JobRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <tr>
        <td className="job-title">
          <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
            {job.jobTitle}
          </a>
        </td>
        <td>
          <span className="company">
            <Building2 size={14} />
            {job.company}
          </span>
        </td>
        <td>
          <span className="location">
            <MapPin size={14} />
            {job.location}
          </span>
        </td>
        <td className="tags-cell">
          {job.tags &&
            job.tags
              .split(",")
              .slice(0, 3)
              .map((tag, i) => (
                <span key={i} className="tag">
                  {tag.trim()}
                </span>
              ))}
        </td>
        <td>
          <span
            className={`source-badge source-${job.source.toLowerCase().replace(/\s/g, "")}`}
          >
            {job.source}
          </span>
        </td>
        <td className="actions">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm"
            title="Apply"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => setShowConfirm(true)}
            className="btn btn-sm btn-danger"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </td>
      </tr>

      {showConfirm &&
        createPortal(
          <ConfirmDialog
            message={`Delete "${job.jobTitle}" at ${job.company}?`}
            onConfirm={() => {
              setShowConfirm(false);
              onDelete(job.id);
            }}
            onCancel={() => setShowConfirm(false)}
          />,
          document.body,
        )}
    </>
  );
}
