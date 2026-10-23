function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <span className="text-sm font-medium text-slate-500">
                {label}
            </span>
            <span className="min-w-0 break-words text-sm font-medium text-slate-800 sm:text-right">
                {value || "-"}
            </span>
        </div>
    );
}

export default InfoRow;
