// components/AdminLogin.tsx
import React, { useState } from 'https://esm.sh/react@18';

interface AdminLoginProps {
    onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (username === 'admin' && password === 'password') {
            onLogin();
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">Admin Login</h2>
                {error && <p className="text-red-400 text-center mb-4" role="alert">{error}</p>}
                <div className="mb-4">
                    <label htmlFor="username" className="block text-slate-300 text-sm font-bold mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-200 leading-tight focus:outline-none focus:shadow-outline bg-slate-700 border-slate-600 focus:border-sky-500 focus:ring-sky-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        aria-label="Username"
                        autoCapitalize="off"
                        autoComplete="username"
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-slate-300 text-sm font-bold mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-200 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-slate-700 border-slate-600 focus:border-sky-500 focus:ring-sky-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-label="Password"
                        autoComplete="current-password"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                        aria-label="Sign In"
                    >
                        Sign In
                    </button>
                </div>
            </form>
        </div>
    );
};