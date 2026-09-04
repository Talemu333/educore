import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Pagination from "@/components/common/Pagination";

const PAGE_SIZE = 10;

const TARGETS = [
    "Parent Financial Records",
    "Payment Transactions",
];

function findTarget(table) {
    let node = table.parentElement;

    for (let depth = 0; node && depth < 6; depth += 1) {
        const text = node.textContent || "";
        const target = TARGETS.find((item) => text.includes(item));

        if (target) {
            return target;
        }

        node = node.parentElement;
    }

    return null;
}

function TablePager({ table, target }) {
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const lastSignature = useRef("");

    useEffect(() => {
        const sync = () => {
            const nextRows = Array.from(
                table.querySelectorAll("tbody > tr")
            );

            const signature = nextRows
                .map(
                    (row) =>
                        row.getAttribute("data-pagination-key") ||
                        row.textContent?.trim()
                )
                .join("|");

            if (signature !== lastSignature.current) {
                lastSignature.current = signature;
                setRows(nextRows);
                setPage(1);
            } else {
                setRows(nextRows);
            }
        };

        sync();

        const observer = new MutationObserver(sync);
        const tbody = table.querySelector("tbody");

        if (tbody) {
            observer.observe(tbody, {
                childList: true,
                subtree: true,
            });
        }

        return () => observer.disconnect();
    }, [table]);

    const totalPages = Math.max(
        1,
        Math.ceil(rows.length / PAGE_SIZE)
    );

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    useEffect(() => {
        const start = (page - 1) * PAGE_SIZE;

        rows.forEach((row, index) => {
            row.style.display =
                index >= start && index < start + PAGE_SIZE
                    ? ""
                    : "none";

            if (target === "Payment Transactions") {
                const serialCell = row.querySelector("td:first-child");

                if (serialCell) {
                    serialCell.textContent = String(start + index + 1);
                }
            }
        });

        return () => {
            rows.forEach((row) => {
                row.style.display = "";
            });
        };
    }, [rows, page, target]);

    if (rows.length <= PAGE_SIZE) {
        return null;
    }

    return (
        <div
            data-dashboard-table-pagination={target}
            className="mt-3"
        >
            <Pagination
                page={page}
                totalPages={totalPages}
                total={rows.length}
                limit={PAGE_SIZE}
                onPageChange={setPage}
            />
        </div>
    );
}

function mountTablePager(table, target) {
    if (table.dataset.paginationMounted === "true") {
        return;
    }

    table.dataset.paginationMounted = "true";

    const mount = document.createElement("div");
    mount.dataset.dashboardPaginationRoot = target;

    table.parentElement?.insertAdjacentElement("afterend", mount);

    if (!mount.parentElement) {
        table.dataset.paginationMounted = "false";
        return;
    }

    const root = createRoot(mount);
    root.render(
        <TablePager
            table={table}
            target={target}
        />
    );

    table.__dashboardPaginationRoot = root;
    table.__dashboardPaginationMount = mount;
}

export default function DashboardTablePaginationEnhancer() {
    useEffect(() => {
        let frame = null;

        const scan = () => {
            frame = null;

            document
                .querySelectorAll("table")
                .forEach((table) => {
                    const target = findTarget(table);

                    if (target) {
                        mountTablePager(table, target);
                    }
                });
        };

        const scheduleScan = () => {
            if (frame === null) {
                frame = window.requestAnimationFrame(scan);
            }
        };

        scheduleScan();

        const observer = new MutationObserver(scheduleScan);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            if (frame !== null) {
                window.cancelAnimationFrame(frame);
            }

            observer.disconnect();

            document
                .querySelectorAll("[data-dashboard-pagination-root]")
                .forEach((mount) => {
                    const table = mount.previousElementSibling?.querySelector?.("table");

                    table?.__dashboardPaginationRoot?.unmount?.();
                    mount.remove();

                    if (table) {
                        table.dataset.paginationMounted = "false";
                    }
                });
        };
    }, []);

    return null;
}
