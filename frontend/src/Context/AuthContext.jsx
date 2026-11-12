import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const getDisplayName = (data) =>
    data?.name ??
    data?.user?.name ??
    data?.fullName ??
    data?.full_name ??
    data?.username ??
    data?.user?.username ??
    data?.email ??
    null;

const readStoredUser = () => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
};

export const AuthProvider = ({ children, showToast }) => {
    const [user, setUser] = useState(readStoredUser);

    const login = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Toast tampil untuk setiap login sukses, tidak lagi bergantung pada userData.name
        if (showToast) {
            const name = getDisplayName(userData);
            showToast(
                name
                    ? `Hai, selamat datang kembali ${name}`
                    : 'Login berhasil, selamat datang kembali',
                'success'
            );
        }
    }, [showToast]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        if (showToast) {
            showToast('Logout berhasil, sampai jumpa kembali', 'success');
        }
    }, [showToast]);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};