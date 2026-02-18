import { Search, RefreshCw, Trash2 } from "lucide-react";
import type { StatsResponse } from "@jobfy/shared";

interface JobFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  stats: StatsResponse | null;
  onRefresh: () => void;
  onClearAll: () => void;
}

export function JobFilters({
  search,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
  stats,
  onRefresh,
  onClearAll,
}: JobFiltersProps) {
  const handleClear = () => {
    if (confirm("Are you sure you want to delete all jobs?")) {
      onClearAll();
    }
  };

  return (
    <div className="controls">
      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search jobs, companies, skills..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        value={sourceFilter}
        onChange={(e) => onSourceFilterChange(e.target.value)}
        className="source-filter"
      >
        <option value="">All Sources</option>
        {stats?.bySource?.map(({ source }) => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>

      <button onClick={onRefresh} className="btn btn-icon" title="Refresh">
        <RefreshCw size={18} />
      </button>

      <button onClick={handleClear} className="btn btn-danger" title="Clear all">
        <Trash2 size={18} />
      </button>
    </div>
  );
}
