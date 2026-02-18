interface JobPaginationProps {
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
}

export function JobPagination({
  total,
  limit,
  offset,
  onOffsetChange,
}: JobPaginationProps) {
  if (total <= limit) return null;

  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="pagination">
      <button
        className="btn btn-sm"
        disabled={offset === 0}
        onClick={() => onOffsetChange(Math.max(0, offset - limit))}
      >
        Previous
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages} ({total} jobs)
      </span>
      <button
        className="btn btn-sm"
        disabled={offset + limit >= total}
        onClick={() => onOffsetChange(offset + limit)}
      >
        Next
      </button>
    </div>
  );
}
