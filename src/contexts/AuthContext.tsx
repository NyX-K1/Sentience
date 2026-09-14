import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
    id: string; // From supabase auth, or if purely custom, we might use a UUID if the table generates it.
    email: string;
    full_name: string;
    username: string;
    timezone: string;
}

interface AuthContextType {
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(() => {
        // Initialize synchronously to prevent redirect on hard reload
        const storedUser = localStorage.getItem('sentience_user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('sentience_user');
                return null;
            }
        }
        return null;
    });

    // We no longer strictly need the useEffect for initial load since it's in useState,
    // but we can keep it if we want to sync across tabs, though not strictly required here.

    const handleSetUser = (newUser: UserProfile | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('sentience_user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('sentience_user');
        }
    };

    const logout = () => {
        handleSetUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser: handleSetUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
