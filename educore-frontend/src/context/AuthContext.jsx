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


const AuthContext =
    createContext(null);


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

                setUser(
                    response.user
                );

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

            if (!userData) {

                setUser(null);

            }

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

            setUser(null);

        }

    };


    /*
    =========================================
    FETCH CURRENT USER
    =========================================
    */

    useEffect(() => {

        const fetchCurrentUser =
            async () => {

                try {

                    const response =
                        await getCurrentUser();


                    if (response?.user) {

                        setUser(
                            response.user
                        );

                    } else {

                        setUser(null);

                    }

                } catch (error) {

                    setUser(null);

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