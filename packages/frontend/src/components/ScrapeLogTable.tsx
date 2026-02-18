import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import type { ScrapeLog, ScrapeStatus } from "@jobfy/shared";

interface ScrapeLogTableProps {
  logs: ScrapeLog[];
}

function StatusIcon({ status }: { status: ScrapeStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle size={16} className="text-green" />;
    case "failed":
      return <XCircle size={16} className="text-red" />;
    case "running":
      return <Loader2 size={16} className="spinning" />;
    default:
      return <Clock size={16} className="text-yellow" />;
  }
}

export function ScrapeLogTable({ logs }: ScrapeLogTableProps) {
  if (logs.length === 0) return <p className="no-data">No scrape logs yet</p>;

  return (
    <table className="logs-table">
      <thead>
        <tr>
          <th>Status</th>
          <th>Sites</th>
          <th>Keyword</th>
          <th>Jobs Found</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log.id}>
            <td>
              <StatusIcon status={log.status} />
            </td>
            <td>{log.sites}</td>
            <td>{log.keyword || "-"}</td>
            <td>{log.jobsFound}</td>
            <td>{new Date(log.startedAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
