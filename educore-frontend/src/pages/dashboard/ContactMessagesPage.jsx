import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Mail,
    Search,
    CheckCircle2,
    Clock3,
    MessageSquareText,
    Inbox,
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import Loading from "@/components/common/Loading";
import {
    getContactMessages,
    updateContactMessageStatus
} from "@/api/contactMessageApi";

const STATUS_OPTIONS = [
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
    { value: "responded", label: "Responded" }
];

const PAGE_SIZE = 10;

const statusClasses = {
    unread: "bg-blue-50 text-blue-700 ring-blue-600/20",
    read: "bg-slate-100 text-slate-700 ring-slate-500/20",
    responded: "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
};

function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function ContactMessagesPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [page, setPage] = useState(1);

    const {
        data: messages = [],
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["contact-messages"],
        queryFn: getContactMessages
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) =>
            updateContactMessageStatus(id, status),
        onSuccess: updated => {
            queryClient.setQueryData(
                ["contact-messages"],
                current =>
                    (current || []).map(message =>
                        message.id === updated.id
                            ? updated
                            : message
                    )
            );

            setSelectedMessage(updated);
        }
    });

    const filteredMessages = useMemo(() => {
        const term = search.trim().toLowerCase();

        return messages.filter(message => {
            const matchesStatus =
                statusFilter === "all" ||
                message.status === statusFilter;

            if (!matchesStatus) return false;
            if (!term) return true;

            return [
                message.name,
                message.email,
                message.phone,
                message.subject,
                message.message
            ]
                .filter(Boolean)
                .some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(term)
                );
        });
    }, [messages, search, statusFilter]);

    const counts = useMemo(() => ({
        total: messages.length,
        unread: messages.filter(m => m.status === "unread").length,
        read: messages.filter(m => m.status === "read").length,
        responded: messages.filter(m => m.status === "responded").length
    }), [messages]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredMessages.length / PAGE_SIZE)
    );

    const paginatedMessages = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredMessages.slice(start, start + PAGE_SIZE);
    }, [filteredMessages, page]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const handleSearchChange = event => {
        setSearch(event.target.value);
        setPage(1);
    };

    const handleStatusFilter = value => {
        setStatusFilter(value);
        setPage(1);
    };

    const goToPage = nextPage => {
        setPage(Math.min(Math.max(nextPage, 1), totalPages));
    };

    const pageStart = filteredMessages.length === 0
        ? 0
        : (page - 1) * PAGE_SIZE + 1;
    const pageEnd = Math.min(
        page * PAGE_SIZE,
        filteredMessages.length
    );

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                <p className="font-semibold">Unable to load contact messages.</p>
                <p className="mt-1 text-sm">
                    {error?.response?.data?.message || "Please try again."}
                </p>
            </div>
        );
    }

    return (
        <div className="min-w-0 space-y-6 overflow-x-hidden">
            <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Website
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                            Contact Messages
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            View and manage enquiries submitted through your school website.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 ring-1 ring-inset ring-slate-200">
                        <Inbox className="h-4 w-4" />
                        {counts.total} {counts.total === 1 ? "message" : "messages"}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Total Messages" value={counts.total} icon={MessageSquareText} iconClass="bg-blue-50 text-blue-600" />
                <SummaryCard label="Unread" value={counts.unread} icon={Inbox} iconClass="bg-amber-50 text-amber-600" />
                <SummaryCard label="Read" value={counts.read} icon={Clock3} iconClass="bg-slate-100 text-slate-600" />
                <SummaryCard label="Responded" value={counts.responded} icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-600" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative min-w-0 flex-1 lg:max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search messages..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FilterButton active={statusFilter === "all"} onClick={() => handleStatusFilter("all")}>
                            All ({counts.total})
                        </FilterButton>
                        {STATUS_OPTIONS.map(option => (
                            <FilterButton
                                key={option.value}
                                active={statusFilter === option.value}
                                onClick={() => handleStatusFilter(option.value)}
                            >
                                {option.label} ({counts[option.value]})
                            </FilterButton>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-5 py-4">Sender</th>
                                <th className="px-5 py-4">Subject</th>
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedMessages.map(message => (
                                <tr
                                    key={message.id}
                                    className="cursor-pointer transition hover:bg-slate-50/80"
                                    onClick={() => setSelectedMessage(message)}
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-semibold text-slate-900">{message.name}</div>
                                        <div className="mt-0.5 text-xs text-slate-500">{message.email}</div>
                                    </td>
                                    <td className="max-w-[320px] px-5 py-4">
                                        <p className="truncate font-medium text-slate-800">{message.subject}</p>
                                        <p className="mt-1 truncate text-xs text-slate-500">{message.message}</p>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                        {formatDate(message.created_at)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${statusClasses[message.status] || statusClasses.unread}`}>
                                            {message.status || "unread"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={event => {
                                                event.stopPropagation();
                                                setSelectedMessage(message);
                                            }}
                                            className="rounded-lg px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                                        >
                                            View message
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {paginatedMessages.length === 0 && (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <p className="mt-4 font-semibold text-slate-800">No contact messages found</p>
                        <p className="mt-1 text-sm text-slate-500">
                            {search || statusFilter !== "all"
                                ? "Try changing your search or filter."
                                : "Messages submitted through the school website will appear here."}
                        </p>
                    </div>
                )}

                {filteredMessages.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{pageStart}</span>–<span className="font-semibold text-slate-700">{pageEnd}</span> of <span className="font-semibold text-slate-700">{filteredMessages.length}</span> messages
                        </p>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => goToPage(page - 1)}
                                disabled={page === 1}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => goToPage(pageNumber)}
                                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                                        page === pageNumber
                                            ? "bg-blue-600 text-white"
                                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => goToPage(page + 1)}
                                disabled={page === totalPages}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedMessage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                            <div className="min-w-0 pr-4">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Contact enquiry</p>
                                <h2 className="mt-1 truncate text-xl font-extrabold text-slate-900">{selectedMessage.subject}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMessage(null)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close message"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailItem label="Name" value={selectedMessage.name} />
                                <DetailItem label="Email" value={selectedMessage.email} />
                                <DetailItem label="Phone" value={selectedMessage.phone || "Not provided"} />
                                <DetailItem label="Received" value={formatDate(selectedMessage.created_at)} />
                            </div>

                            <div className="mt-6 rounded-xl bg-slate-50 p-5 ring-1 ring-inset ring-slate-200">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Message</p>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedMessage.message}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-slate-500">Update enquiry status</div>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        disabled={statusMutation.isPending}
                                        onClick={() => statusMutation.mutate({ id: selectedMessage.id, status: option.value })}
                                        className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                            selectedMessage.status === option.value
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ label, value, icon: Icon, iconClass }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
        </div>
    );
}

function FilterButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            }`}
        >
            {children}
        </button>
    );
}

function DetailItem({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
        </div>
    );
}

export default ContactMessagesPage;
