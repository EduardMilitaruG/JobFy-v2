import type { Job } from "@jobfy/shared";
import { JobRow } from "./JobRow.js";
import { LoadingSpinner } from "./LoadingSpinner.js";
import { EmptyState } from "./EmptyState.js";

interface JobTableProps {
  jobs: Job[];
  loading: boolean;
  onDelete: (id: number) => void;
}

export function JobTable({ jobs, loading, onDelete }: JobTableProps) {
  if (loading) return <LoadingSpinner text="Loading jobs..." />;
  if (jobs.length === 0)
    return (
      <EmptyState message="No jobs found. Start scraping to populate the database!" />
    );

  return (
    <div className="job-table-container">
      <table className="job-table">
        <thead>
          <tr>
            <th>Job Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>Tags</th>
            <th>Source</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
