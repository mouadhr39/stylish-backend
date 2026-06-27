import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/client";
import { useLocation } from "react-router-dom";

export interface User {
    name: string;
    email: string;
    accessToken: string;
    refreshToken: string;
};

export interface Credentials {
    username: string;
    password: string;
};

interface AuthorizationContextType {
    user?: User;
    isAuthenticated: boolean;
    isLoading: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setUser: (user?: User) => void;
    setIsLoading: (isLoading: boolean) => void;

    login: (credentials: Credentials) => Promise<void>;
    logout: () => void;

}

const AuthorizationContext = createContext<AuthorizationContextType | null>(null);

interface AuthorizationProviderProps {
    children: React.ReactNode;
};

const LocalStorageManager = {
    getAccessToken: (): string | null => {
        return localStorage.getItem("access_token");
    },
    getRefreshToken: (): string | null => {
        return localStorage.getItem("refresh_token");
    },
    getUser: (): User | null => {
        const userData = localStorage.getItem("user");
        return userData ? JSON.parse(userData) : null;
    },
    setAccessToken: (token: string): void => {
        localStorage.setItem("access_token", token);
    },
    setRefreshToken: (token: string): void => {
        localStorage.setItem("refresh_token", token);
    },
    setUser: (user: User): void => {
        localStorage.setItem("user", JSON.stringify(user));
    },

    init:(response: any): void => {
        if (response.access_token && response.refresh_token && response.user) {
            LocalStorageManager.setAccessToken(response.access_token);
            LocalStorageManager.setRefreshToken(response.refresh_token);
            LocalStorageManager.setUser(response.user);
        } else {
            throw new Error("Invalid response: Missing access_token, refresh_token, or user.");
        }
    },
    clear: (): void => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
    }
};

export const AuthorizationProvider: React.FC<AuthorizationProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const { pathname } = useLocation();
    const isFirstRender = useRef(true);
    
    const clearAuthentication = (): void => {
            LocalStorageManager.clear();
            setIsAuthenticated(false);
            setUser(undefined);
        };

    useEffect(() => {
       

        const tryRefresh = async (): Promise<void> => {
            const refreshToken = LocalStorageManager.getRefreshToken();

            if (!refreshToken) {
                clearAuthentication();
                return;
            }

            try {
                const refreshResponse = await api.post("/refresh", {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });

                if (refreshResponse.status === 200 && refreshResponse.data.access_token) {
                    LocalStorageManager.setAccessToken(refreshResponse.data.access_token);
                    setIsAuthenticated(true);
                } else {
                    clearAuthentication();
                }
            } catch (error) {
                console.error("Error checking authentication:", error);
                clearAuthentication();
            }
        };

        const checkAuthentication = async (): Promise<void> => {
            const accessToken = LocalStorageManager.getAccessToken();
            const userData = LocalStorageManager.getUser();

            if (!accessToken || !userData) return;

            try {
                const verifyResponse = await api.post("/verify", {}, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (verifyResponse.status === 200 && verifyResponse.data.result) {
                    setIsAuthenticated(true);
                    setUser(verifyResponse.data.user);
                    return;
                }

                clearAuthentication();
            } catch (error) {
                console.error("Error checking authentication:", error);
                await tryRefresh();
            }
        };

        checkAuthentication().finally(() => {
            if (isFirstRender.current) {
                setIsLoading(false);
                isFirstRender.current = false;
            }
        });
    }, [pathname]);

    const login = async (credentials: Credentials): Promise<void> => {
        try {
            const loginResponse = await api.post("/login", credentials);

            if (loginResponse.status !== 200) {
                throw new Error("Server error: Login failed, status: " + loginResponse.status);
            }

            if (!loginResponse.data.access_token || !loginResponse.data.refresh_token || !loginResponse.data.user) {
                throw new Error("Server error: Invalid login response.");
            }


            LocalStorageManager.init(loginResponse.data);

            setIsAuthenticated(true);
            setUser(loginResponse.data.user);

        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    };



    const logout = (): void => {
        clearAuthentication();
    };

    const contextValue: AuthorizationContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        setIsAuthenticated,
        setUser,
        setIsLoading,
    };

    return (
        <AuthorizationContext.Provider value={contextValue}>
            {children}
        </AuthorizationContext.Provider>
    );

};

export const useAuthorization = (): AuthorizationContextType => {
    const context = useContext(AuthorizationContext);
    if (!context) {
        throw new Error("useAuthorization must be used within an AuthorizationProvider");
    }
    return context;
};