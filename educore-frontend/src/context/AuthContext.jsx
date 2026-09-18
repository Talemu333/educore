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
import { saveOfflineUser, getOfflineUser, clearOfflineUser } from "../lib/offline/offlineAuth";


const AuthContext =
    createContext(null);


function shouldSkipInitialAuthCheck() {
    const pathname =
        window.location.pathname.toLowerCase();

    /*
    Partner accounts use their own session/authentication
    endpoints. The main school-user /api/auth/me check is
    therefore unnecessary on these public partner pages and
    would otherwise produce an expected 401 for logged-out
    visitors.
    */
    return (
        pathname === "/partners" ||
        pathname.startsWith("/partners/") ||
        pathname.startsWith("/r/")
    );
}


export function AuthProvider({
    children
}) {

    const [
        user,
        setUser
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    /*
    =========================================
    LOGIN USER
    =========================================
    */

    const loginUser = async (userData) => {

        /*
        -----------------------------------------
        Temporarily use the login response
        -----------------------------------------
        */

        if (userData) {
            setUser(userData);
            if (navigator.onLine) {
                await saveOfflineUser(userData).catch(() => {});
            }
        }


        /*
        -----------------------------------------
        Get the authoritative current user
        -----------------------------------------

        This ensures that role_name and
        admin_type are both available
        immediately after login.
        */

        try {

            const response =
                await getCurrentUser();


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

            /*
            -------------------------------------
            If the login response itself contains
            a valid user, keep it.
            -------------------------------------
            */

            if (!navigator.onLine) {
                const cachedUser = await getOfflineUser().catch(() => null);
                if (cachedUser) {
                    setUser(cachedUser);
                    return cachedUser;
                }
            }

            if (!userData) setUser(null);
            return userData || null;

        }

    };


    /*
    =========================================
    LOGOUT USER
    =========================================
    */

    const logoutUser = async () => {

        try {

            await logout();

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        } finally {
            await clearOfflineUser().catch(() => {});
            setUser(null);
        }

    };


    /*
    =========================================
    FETCH CURRENT USER
    =========================================
    */

    useEffect(() => {

        if (shouldSkipInitialAuthCheck()) {

            setLoading(false);
            return;

        }

        const fetchCurrentUser =
            async () => {

                try {

                    const response =
                        await getCurrentUser();


                    if (response?.user) {
                        setUser(response.user);
                        await saveOfflineUser(response.user).catch(() => {});
                    } else {
                        setUser(null);
                    }

                } catch (error) {
                    if (!navigator.onLine) {
                        const cachedUser = await getOfflineUser().catch(() => null);
                        setUser(cachedUser);
                    } else {
                        setUser(null);
                    }

                } finally {

                    setLoading(false);

                }

            };


        fetchCurrentUser();

    }, []);


    /*
    =========================================
    AUTH CONTEXT
    =========================================
    */

    return (

        <AuthContext.Provider
            value={{

                user,

                loading,

                loginUser,

                logoutUser,

                isAuthenticated:
                    !!user

            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


/*
=========================================
USE AUTH
=========================================
*/

export function useAuth() {

    return useContext(
        AuthContext
    );

}
