import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/utils/cn";
import { GetBgColor } from "../layout/GetBgColor";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { LoginResponse } from "@/api/authApi";

type PaginationProps = {
    total: number;
    pagination: {
        page: number;
        limit: number;
    }
    setPagination: (pagination: { page: number, limit: number }) => void;
}
export const Pagination = ({ total, pagination: { page, limit }, setPagination }: PaginationProps) => {
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)

    return (

        <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center text-sm text-gray-500">
                Mostrando {Math.min(total, (page - 1) * limit + 1)} a {Math.min(total, page * limit)} de {total} resultados
            </div>
            <div className="flex items-center gap-2">
                <select
                    value={limit}
                    onChange={(e) => {
                        setPagination({
                            page: 1,
                            limit: Number(e.target.value)
                        });
                    }}
                    className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                </select>
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPagination({
                            page: page - 1,
                            limit
                        })}
                        disabled={page === 1}
                        className="h-10 w-10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {(() => {
                        const pages = [];
                        const totalPagesCount = Math.ceil(total / limit);

                        // Always show first page
                        pages.push(1);

                        // Show ellipsis and pages around current page if not near start
                        if (page > 2) {
                            pages.push('...');
                            // Show one page before current page
                            pages.push(page - 1);
                        }

                        // Show current page if not already included
                        if (!pages.includes(page)) {
                            pages.push(page);
                        }

                        // Show one page after current page if not near end
                        if (page < totalPagesCount - 1) {
                            pages.push(page + 1);
                            pages.push('...');
                        }

                        // Always show last page if there is more than one page
                        if (totalPagesCount > 1 && !pages.includes(totalPagesCount)) {
                            pages.push(totalPagesCount);
                        }

                        return pages.map((pageNumber, index) => (
                            pageNumber === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                            ) : (
                                <Button
                                    key={pageNumber}
                                    variant={page === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPagination({
                                        page: pageNumber as number,
                                        limit
                                    })}
                                    className={cn(
                                        "h-10 w-10 p-0",
                                        page === pageNumber && GetBgColor(user?.companies?.[0]?.id, true)
                                    )}
                                >
                                    {pageNumber}
                                </Button>
                            )
                        ));
                    })()}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPagination({
                            page: page + 1,
                            limit
                        })}
                        disabled={page === Math.ceil(total / limit)}
                        className="h-10 w-10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
