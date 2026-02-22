"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Build page numbers: show max 5 around current
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <span className="page-info">
        {from}–{to} of {total}
      </span>
      <div className="page-btns">
        <button
          className="page-btn"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous"
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`e${i}`}
              className="page-btn"
              style={{
                cursor: "default",
                border: "none",
                background: "transparent",
              }}
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === page ? "active" : ""}`}
              onClick={() => onPage(p as number)}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="page-btn"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </div>
  );
}
