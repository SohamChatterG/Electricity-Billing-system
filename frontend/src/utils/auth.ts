import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: any;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data.user);
                    setIsAdmin(response.data.user.role === 'admin');
                }
            } catch (error) {
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsAdmin(response.data.user.role === 'admin');
            navigate('/');
        } catch (error) {
            throw error;
        }
    };

    const signup = async (userData: any) => {
        try {
            const response = await axios.post('/api/auth/signup', userData);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            setIsAdmin(response.data.user.role === 'admin');
            navigate('/');
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAdmin(false);
        navigate('/auth/login');
    };

    return (
        <AuthContext.Provider value= {{ user, isAdmin, login, signup, logout, loading }
}>
    { children }
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};