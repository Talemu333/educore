import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    logout
} from "../services/authService";

import {
    saveOfflineUser,
    getOfflineUser,
    clearOfflineUser
} from "@/lib/offline/offlineAuth";

const AuthContext = createContext(null);

function shouldSkipInitialAuthCheck() {
    const pathname = window.location.pathname.toLowerCase();

    return (
        pathname === "/partners" ||
        pathname.startsWith("/partners/") ||
        pathname.startsWith("/r/")
    );
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loginUser = async (userData) => {
        if (userData) {
            setUser(userData);
            await saveOfflineUser(userData).catch(() => {});
        }

        try {
            const response = await getCurrentUser();

            if (response?.user) {
                setUser(response.user);
                await saveOfflineUser(response.user).catch(() => {});
                return response.user;
            }
        } catch (error) {
            console.error(
                "Failed to load current user after login:",
                error
            );

            const offlineUser = await getOfflineUser().catch(() => null);
            const fallbackUser = userData || offlineUser;

            if (fallbackUser) {
                setUser(fallbackUser);
                return fallbackUser;
            }
        }

        setUser(null);
        return null;
    };

    const logoutUser = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            await clearOfflineUser().catch(() => {});
        }
    };

    useEffect(() => {
        if (shouldSkipInitialAuthCheck()) {
            setLoading(false);
            return;
        }

        const fetchCurrentUser = async () => {
            try {
                const response = await getCurrentUser();

                if (response?.user) {
                    setUser(response.user);
                    await saveOfflineUser(response.user).catch(() => {});
                } else {
                    setUser(null);
                    await clearOfflineUser().catch(() => {});
                }
            } catch (error) {
                const offlineUser = await getOfflineUser().catch(() => null);
                setUser(offlineUser);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loginUser,
                logoutUser,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
