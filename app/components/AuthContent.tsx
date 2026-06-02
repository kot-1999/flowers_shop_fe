import { createContext, useContext, useState, useEffect } from "react";
import {UserRole} from "@/app/utils/enums";

interface AuthContextType {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        googleProfileID: string;
        role: UserRole
    } | null;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setIsAuthenticated] = useState(null);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me', { cache: 'no-store', method: 'GET' });
            const data = await res.json();

            if (res.ok) {
                setIsAuthenticated(data)
            } else {
                setIsAuthenticated(null)
            }; // true if userToken exists
        } catch (err) {
            setIsAuthenticated(null);
        }
    };

    useEffect(() => {
        checkAuth(); // initial check
    }, []);

    return (
        <AuthContext.Provider value={{ user, checkAuth }}>
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