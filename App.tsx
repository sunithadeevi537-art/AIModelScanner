// App.tsx
import React, { useState, useEffect, useCallback } from 'https://esm.sh/react@18';
import { AppHeader } from './components/Header.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { PlayerView } from './components/PlayerView.tsx';
import { TournamentData, TournamentSettings } from './types.ts';
import { getLocalStorage, setLocalStorage, LS_ADMIN_LOGGED_IN, LS_TOURNAMENT_DATA } from './utils.ts';


const defaultTournamentSettings: TournamentSettings = {
    name: 'Untitled Tournament',
    types: [],
    categories: [],
};

const defaultTournamentData: TournamentData = {
    settings: defaultTournamentSettings,
    players: [],
    fixtures: [],
    isPublished: false,
};

export const App: React.FC = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(getLocalStorage(LS_ADMIN_LOGGED_IN, false));
    const [viewMode, setViewMode] = useState<'admin' | 'player' | 'admin-login'>(isAdmin ? 'admin' : 'player');
    const [tournamentData, setTournamentData] = useState<TournamentData>(getLocalStorage(LS_TOURNAMENT_DATA, defaultTournamentData));
    const [isPublishing, setIsPublishing] = useState(false);

    // Persist admin login state
    useEffect(() => {
        setLocalStorage(LS_ADMIN_LOGGED_IN, isAdmin);
        if (!isAdmin && viewMode === 'admin') {
            setViewMode('admin-login'); // Redirect to login if admin logs out
        }
    }, [isAdmin]);

    // Persist tournament data
    useEffect(() => {
        setLocalStorage(LS_TOURNAMENT_DATA, tournamentData);
        // Update publish status in header based on tournamentData.isPublished
        // console.log("App: tournamentData updated, isPublished:", tournamentData.isPublished); // excessive
    }, [tournamentData]);

    // Handler for admin login
    const handleAdminLogin = useCallback(() => {
        setIsAdmin(true);
        setViewMode('admin');
    }, []);

    // Handler for admin logout
    const handleLogout = useCallback(() => {
        setIsAdmin(false);
        setViewMode('player'); // Redirect to player view after logout
    }, []);

    const handlePublishTournament = useCallback(() => {
        setTournamentData(prev => ({ ...prev, isPublished: true }));
    }, []);

    const publishStatusText = isPublishing ? 'Publishing...' : (tournamentData.isPublished ? 'Published' : 'Draft');

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <AppHeader
                isAdmin={isAdmin}
                onLogout={handleLogout}
                viewMode={viewMode}
                setViewMode={setViewMode}
                publishStatus={publishStatusText}
            />
            <main className="container mx-auto p-4">
                {viewMode === 'admin-login' && <AdminLogin onLogin={handleAdminLogin} />}
                {viewMode === 'admin' && isAdmin && (
                    <AdminDashboard
                        tournamentData={tournamentData}
                        setTournamentData={setTournamentData}
                        onPublish={handlePublishTournament}
                        isPublishing={isPublishing}
                        setIsPublishing={setIsPublishing}
                    />
                )}
                {viewMode === 'player' && (
                    <PlayerView />
                )}
            </main>
        </div>
    );
};