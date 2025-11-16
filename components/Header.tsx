// components/Header.tsx
import React from 'https://esm.sh/react@18';

interface AppHeaderProps {
    isAdmin: boolean;
    onLogout: () => void;
    viewMode: 'admin' | 'player' | 'admin-login';
    setViewMode: (mode: 'admin' | 'player' | 'admin-login') => void;
    publishStatus: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ isAdmin, onLogout, viewMode, setViewMode, publishStatus }) => {
    const LogoIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-2.286 9.144a3.75 3.75 0 003.75 4.498h1.5A3.75 3.75 0 0016.5 12.25l-2.286-9.144a3.75 3.75 0 00-4.464 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.002 9.002 0 008.13-5.253M3.87 15.747A9.002 9.002 0 0012 21" />
        </svg>
    );

    const statusColor = publishStatus === 'Published' ? 'bg-green-600' : publishStatus === 'Publishing...' ? 'bg-yellow-600' : 'bg-slate-600';
    const statusText = publishStatus;

    return (
        <header className="bg-slate-900/70 backdrop-blur-lg p-4 border-b border-slate-700 sticky top-0 z-10">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <LogoIcon />
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                        Tournament Manager
                    </h1>
                    {isAdmin && (
                        <span className={`ml-3 px-3 py-1 text-xs font-semibold text-white rounded-full ${statusColor}`} aria-label={`Publishing status: ${statusText}`}>
                            {statusText}
                        </span>
                    )}
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setViewMode('admin')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'admin' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                            aria-label="Admin Dashboard"
                        >
                            Admin Dashboard
                        </button>
                        <button
                            onClick={() => setViewMode('player')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'player' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                            aria-label="Player View"
                        >
                            Player View
                        </button>
                        <button
                            onClick={onLogout}
                            className="py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition-colors"
                            aria-label="Logout"
                        >
                            Logout
                        </button>
                    </div>
                )}
                 {!isAdmin && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setViewMode('admin-login')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'admin-login' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                            aria-label="Admin Login"
                        >
                            Admin Login
                        </button>
                        <button
                            onClick={() => setViewMode('player')}
                            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'player' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                            aria-label="Player View"
                        >
                            Player View
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};