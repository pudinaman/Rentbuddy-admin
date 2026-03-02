import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    windowSize?: number; // how many page buttons to show (default 3)
}

// no dots, just a sliding window of N pages
const createPaginationRange = (
    currentPage: number,
    totalPages: number,
    windowSize: number = 3
): number[] => {
    // if total pages are less than window, just show all
    if (totalPages <= windowSize) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(windowSize / 2);

    let start = currentPage - half;
    let end = currentPage + half;

    // clamp to start
    if (start < 1) {
        start = 1;
        end = windowSize;
    }

    // clamp to end
    if (end > totalPages) {
        end = totalPages;
        start = totalPages - windowSize + 1;
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
};

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
    windowSize = 3,
}) => {
    if (totalPages <= 1) return null;

    const pages = createPaginationRange(currentPage, totalPages, windowSize);

    // state for "go to page"
    const [jumpPage, setJumpPage] = useState<number>(currentPage);

    // keep input in sync if currentPage changes from outside
    useEffect(() => {
        setJumpPage(currentPage);
    }, [currentPage]);

    const handleChange = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };

    const handleJump = () => {
        if (!jumpPage) return;
        let page = jumpPage;

        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <div
            className={`flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm ${className}`}
        >
            {/* Previous */}
            <button
                type="button"
                onClick={() => handleChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Pages */}
            <div className="flex items-center gap-1 sm:gap-2">
                {pages.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => handleChange(item)}
                        aria-current={item === currentPage ? "page" : undefined}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition
              ${item === currentPage
                                ? "bg-indigo-500 text-white shadow-md"
                                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Go to page */}


            {/* Next */}
            <button
                type="button"
                onClick={() => handleChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                    Jump to
                </span>
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPage}
                    onChange={(e) => setJumpPage(Number(e.target.value))}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleJump();
                        }
                    }}
                    className="h-8 w-14 rounded-lg border dark:text-slate-300 border-slate-300 bg-white px-2 text-center text-xs outline-none dark:border-slate-700 dark:bg-slate-900"
                />
                <button
                    type="button"
                    onClick={handleJump}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    Go
                </button>
            </div>
        </div>
    );
};
