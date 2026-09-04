import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

function Pagination({
    page = 1,
    totalPages = 1,
    total = 0,
    limit = 10,
    onPageChange,
    disabled = false,
}) {
    if (totalPages <= 1) return null;

    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{start}</span>–
                <span className="font-medium text-slate-700">{end}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span>
            </p>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="gap-1.5"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <span className="min-w-[84px] text-center text-sm font-medium text-slate-600">
                    Page {page} of {totalPages}
                </span>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="gap-1.5"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default Pagination;
