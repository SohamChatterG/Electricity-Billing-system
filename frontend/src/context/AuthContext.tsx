import { createContext, useContext, useState, ReactNode } from 'react';
import { useEffect } from 'react';
interface AuthContextType {
    isLoggedIn: boolean;
    userRole: 'admin' | 'customer' | null;
    login: (token: string, role: 'admin' | 'customer') => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);

    // Check for existing token on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role') as 'admin' | 'customer' | null;

        if (token && role) {
            setIsLoggedIn(true);
            setUserRole(role);
        }
    }, []);

    const login = (token: string, role: 'admin' | 'customer') => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        setIsLoggedIn(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};