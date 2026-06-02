import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me', { cache: 'no-store', method: 'GET' });
            const data = await res.json();
            setIsAuthenticated(data.isAuthenticated); // true if userToken exists
        } catch (err) {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkAuth(); // initial check
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be inside AuthProvider");
    }
    return context;
};