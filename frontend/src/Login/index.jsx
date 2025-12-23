import React, { useState } from 'react';
import { User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import './index.css';
import { useAuth } from '../Context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // IMPORTANT: refresh token cookie
                body: JSON.stringify({
                    name: username,
                    password: password
                })
            });

            if (!res.ok) {
                throw new Error('Username atau password salah');
            }

            const data = await res.json();

            // Save access token
            localStorage.setItem('accessToken', data.accessToken);

            // Optional: save user info
            localStorage.setItem('user', JSON.stringify(data.user));

            // Notify parent component
            login(true, data.user);

        } catch (err) {
            setError(err.message || 'Login gagal');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>ADVENTURE <span>WORKS</span></h1>
                    <p>Masuk untuk mengakses Executive Dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-alert">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Memproses...' : (
                            <>
                                Masuk Dashboard <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2025 Adventure Works BI System</p>
                </div>
            </div>
        </div>
    );
};

export default Login;