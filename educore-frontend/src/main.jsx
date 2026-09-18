import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import "./schoolThemeOverrides.css";
import { AuthProvider } from "./context/AuthContext";
import { SchoolThemeProvider } from "./context/SchoolThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardTablePaginationEnhancer from "./components/common/DashboardTablePaginationEnhancer";
import WebsiteSectionFormAutoScroll from "./components/common/WebsiteSectionFormAutoScroll";
import OfflineStatus from "./components/common/OfflineStatus";

const queryClient = new QueryClient();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
            console.warn("EduProw service worker registration failed:", error);
        });
    });
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <SchoolThemeProvider>
                <App />
                <DashboardTablePaginationEnhancer />
                <WebsiteSectionFormAutoScroll />
                <OfflineStatus />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        success: {
                            style: {
                                background: "#16a34a",
                                color: "#fff",
                            },
                        },
                        error: {
                            style: {
                                background: "#dc2626",
                                color: "#fff",
                            },
                        },
                    }}
                />
            </SchoolThemeProvider>
        </AuthProvider>
    </QueryClientProvider>
);
