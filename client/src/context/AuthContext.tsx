import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    identifier: string;
    role: 'LIBRARIAN' | 'STUDENT';
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('lms_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        }
    }, []);

        const login = (userData: User) => {
            setUser(userData);
            localStorage.setItem('lms_user', JSON.stringify(userData));
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));
        };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lms_user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
