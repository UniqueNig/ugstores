import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsisThreshold = 5;

    if (totalPages <= showEllipsisThreshold) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className="flex items-center justify-between py-4 px-6 border-t"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="text-xs font-['DM_Sans']"
        style={{ color: "var(--text-muted)" }}
      >
        {itemsPerPage && totalItems ? (
          <>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
            items
          </>
        ) : (
          <>
            Page {currentPage} of {totalPages}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-full border hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-xs text-center"
                style={{ color: "var(--text-muted)" }}
              >
                •••
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold font-['DM_Sans'] border transition-all ${
                  currentPage === page ? "opacity-100" : "hover:opacity-70"
                }`}
                style={
                  currentPage === page
                    ? {
                        backgroundColor: "var(--accent)",
                        borderColor: "var(--accent)",
                        color: "#16240f",
                      }
                    : {
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-full border hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
