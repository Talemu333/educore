import { useEffect, useState } from "react";

export default function OfflineStatus() {
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);
    const [showBackOnline, setShowBackOnline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowBackOnline(true);
            const timer = window.setTimeout(() => setShowBackOnline(false), 3000);
            return () => window.clearTimeout(timer);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBackOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline && !showBackOnline) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-0 bottom-0 z-[9999] flex justify-center px-3 pb-3 pointer-events-none"
        >
            <div className="rounded-full bg-slate-900 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg">
                {isOnline ? "Back online" : "Offline — changes will sync when internet returns"}
            </div>
        </div>
    );
}
