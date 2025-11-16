// components/PlayerView.tsx
import React, { useState, useEffect, useCallback } from 'https://esm.sh/react@18';
import { TournamentData, PlayerCategory, Player } from '../types.ts';
import { getLocalStorage, LS_TOURNAMENT_DATA } from '../utils.ts';

export const PlayerView: React.FC = () => { // No longer receives tournamentData as a prop, fetches directly
    const [localTournamentData, setLocalTournamentData] = useState<TournamentData | null>(null);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState<PlayerCategory | 'All'>('All'); // State for players category filtering
    const [searchTerm, setSearchTerm] = useState(''); // New state for player search
    const [selectedFixtureFilterCategory, setSelectedFixtureFilterCategory] = useState<PlayerCategory | 'All'>('All'); // State for fixtures filtering
    const [selectedFixtureFilterGroup, setSelectedFixtureFilterGroup] = useState<string | 'All'>('All'); // NEW: State for group filtering

    // Define getPlayerName here, unconditionally, before any early returns
    const getPlayerName = useCallback((playerId: string) => {
        // Safely access players array even if localTournamentData is null or players is undefined
        const playersArray = localTournamentData?.players || [];
        const player = playersArray.find(p => p.id === playerId);
        return player ? player.name : `Unknown Player (${playerId ? playerId.substring(0,4) : 'N/A'})`;
    }, [localTournamentData]); // Depend on the entire localTournamentData object

    const fetchTournamentData = useCallback(() => {
        const storedData = getLocalStorage<TournamentData | null>(LS_TOURNAMENT_DATA, null);
        console.log('PlayerView: Fetched from localStorage. isPublished:', storedData?.isPublished, 'Settings Name:', storedData?.settings?.name, 'Full Data:', storedData);
        setLocalTournamentData(storedData);
    }, []);

    useEffect(() => {
        fetchTournamentData();
    }, [fetchTournamentData]); // Fetch once on mount

    // Re-fetch if localStorage changes (e.g., admin publishes)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // Only react to changes in our specific key or if event.key is null (change in current tab/same origin)
            if (event.key === LS_TOURNAMENT_DATA || event.key === null) {
                console.log('PlayerView: localStorage "storage" event fired. Re-fetching data.');
                fetchTournamentData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchTournamentData]);

    // NEW: Reset group filter when category filter changes
    useEffect(() => {
        setSelectedFixtureFilterGroup('All');
    }, [selectedFixtureFilterCategory]);


    if (!localTournamentData || !localTournamentData.settings || !localTournamentData.settings.name) {
        // No tournament data or basic settings are missing
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-2.286 9.144a3.75 3.75 0 003.75 4.498h1.5A3.75 3.75 0 0016.5 12.25l-2.286-9.144a3.75 3.75 0 00-4.464 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.002 9.002 0 008.13-5.253M3.87 15.747A9.002 9.002 0 0012 21" />
                </svg>
                <h2 className="text-2xl font-bold mb-2">No Tournament Data Available</h2>
                <p className="text-lg">An administrator needs to set up and publish a tournament.</p>
            </div>
        );
    }

    if (!localTournamentData.isPublished) {
        // Tournament data exists, but it's not published
         return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-2.286 9.144a3.75 3.75 0 003.75 4.498h1.5A3.75 3.75 0 0016.5 12.25l-2.286-9.144a3.75 3.75 0 00-4.464 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.002 9.002 0 008.13-5.253M3.87 15.747A9.002 9.002 0 0012 21" />
                </svg>
                <h2 className="text-2xl font-bold mb-2">Tournament In Draft Mode</h2>
                <p className="text-lg">This tournament has not yet been published by the administrator.</p>
                <p className="text-lg">Check back later for tournament details and fixtures!</p>
            </div>
        );
    }

    // Filter players based on selectedFilterCategory and searchTerm
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredPlayers = localTournamentData.players.filter(player => {
        const matchesCategory = selectedFilterCategory === 'All' || player.categories.includes(selectedFilterCategory);
        const matchesSearch = player.name.toLowerCase().includes(lowerCaseSearchTerm) || 
                                  player.mobile.includes(lowerCaseSearchTerm);
        return matchesCategory && matchesSearch;
    });


    const groupedPlayers: { [mobile: string]: Player[] } = filteredPlayers.reduce((acc: { [mobile: string]: Player[] }, player) => {
        if (!acc[player.mobile]) {
            acc[player.mobile] = [];
        }
        acc[player.mobile].push(player);
        return acc;
    }, {});

    // Filter fixtures based on selectedFixtureFilterCategory
    const categoryFilteredFixtures = selectedFixtureFilterCategory === 'All'
        ? localTournamentData.fixtures
        : localTournamentData.fixtures.filter(catFix => catFix.category === selectedFixtureFilterCategory);


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <h2 className="text-4xl font-bold text-sky-400 mb-6 text-center">
                {localTournamentData.settings.name}
            </h2>

            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-slate-100 mb-4">Tournament Details</h3>
                <p className="text-slate-300 mb-2">
                    <span className="font-medium text-slate-200">Types:</span> {localTournamentData.settings.types.join(', ')}
                </p>
                <p className="text-slate-300">
                    <span className="font-medium text-slate-200">Categories:</span> {localTournamentData.settings.categories.join(', ')}
                </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h3 className="2xl font-semibold text-slate-100">Registered Players</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <div className="flex-grow">
                            <label htmlFor="playerSearch" className="sr-only">Search Players</label>
                            <input
                                type="text"
                                id="playerSearch"
                                placeholder="Search by name or mobile number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white sm:text-sm w-full"
                                aria-label="Search players by name or mobile number"
                            />
                        </div>
                        {localTournamentData.settings.categories.length > 0 && (
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <label htmlFor="categoryFilter" className="text-slate-300 text-sm sr-only">Filter by Category:</label>
                                <select
                                    id="categoryFilter"
                                    value={selectedFilterCategory}
                                    onChange={(e) => setSelectedFilterCategory(e.target.value as PlayerCategory | 'All')}
                                    className="py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white sm:text-sm"
                                    aria-label="Filter players by category"
                                >
                                    <option value="All">All Categories</option>
                                    {localTournamentData.settings.categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                {Object.keys(groupedPlayers).length === 0 ? (
                    <p className="text-slate-400">No players registered yet or no players match the selected criteria.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow">
                        <table className="min-w-full divide-y divide-slate-700" aria-label="Registered Players Table">
                            <thead className="bg-slate-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Mobile Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Player Name(s)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Categories
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Fee Paid
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {Object.entries(groupedPlayers).map(([mobile, playersArr]) => (
                                    <tr key={mobile} className="hover:bg-slate-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                                            {mobile}
                                        </td>
                                        {/* Fix: Explicitly cast playersArr to Player[] to ensure correct type inference */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {(playersArr as Player[]).map(p => p.name).join(', ')}
                                        </td>
                                        {/* Fix: Explicitly cast playersArr to Player[] to ensure correct type inference */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {(playersArr as Player[]).map(p => p.categories.join(' & ')).join('; ')}
                                        </td>
                                        {/* Fix: Explicitly cast playersArr to Player[] to ensure correct type inference */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            {(playersArr as Player[]).every(p => p.feePaid) ? 'Yes' : 'No'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
                <div className="flex flex-wrap gap-4 items-center mb-4">
                    <h3 className="2xl font-semibold text-slate-100">Match Fixtures</h3>
                    {localTournamentData.settings.categories.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <label htmlFor="fixtureCategoryFilter" className="text-slate-300 text-sm">Filter by Category:</label>
                            <select
                                id="fixtureCategoryFilter"
                                value={selectedFixtureFilterCategory}
                                onChange={(e) => setSelectedFixtureFilterCategory(e.target.value as PlayerCategory | 'All')}
                                className="py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white sm:text-sm"
                                aria-label="Filter fixtures by category"
                            >
                                <option value="All">All Categories</option>
                                {localTournamentData.settings.categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedFixtureFilterCategory !== 'All' && localTournamentData.fixtures.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <label htmlFor="fixtureGroupFilter" className="text-slate-300 text-sm">Filter by Group:</label>
                            <select
                                id="fixtureGroupFilter"
                                value={selectedFixtureFilterGroup}
                                onChange={(e) => setSelectedFixtureFilterGroup(e.target.value)}
                                className="py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white sm:text-sm"
                                aria-label="Filter fixtures by group"
                            >
                                <option value="All">All Groups</option>
                                {localTournamentData.fixtures
                                    .filter(f => f.category === selectedFixtureFilterCategory)
                                    .flatMap(f => f.groups)
                                    .map(group => (
                                        <option key={group.id} value={group.name}>{group.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    )}
                </div>

                {categoryFilteredFixtures.length === 0 ? (
                    <p className="text-slate-400">No fixtures published yet or no fixtures match the selected category/group.</p>
                ) : (
                    <div className="space-y-6">
                        {categoryFilteredFixtures.map(catFix => {
                            // Apply group filter *within* this category fixture
                            const displayGroups = selectedFixtureFilterGroup === 'All'
                                ? catFix.groups
                                : catFix.groups.filter(g => g.name === selectedFixtureFilterGroup);

                            const displayMatches = selectedFixtureFilterGroup === 'All'
                                ? catFix.matches
                                : catFix.matches.filter(m => m.groupName === selectedFixtureFilterGroup);
                            
                            // Only render this category's fixtures if there are groups to display
                            if (displayGroups.length === 0) return null;

                            return (
                                <div key={`${catFix.category}-${catFix.tournamentType}`} className="bg-slate-700 p-4 rounded-lg">
                                    <h4 className="text-xl font-semibold text-slate-100 mb-3">{catFix.category} - {catFix.tournamentType}</h4>
                                    {displayGroups.map(group => ( // Loop through potentially filtered groups
                                        <div key={group.id} className="mb-4">
                                            <h5 className="font-bold text-slate-200 mb-2">{group.name}</h5>
                                            <p className="text-sm text-slate-300 mb-3">Players: {group.playerIds.map(getPlayerName).join(', ')}</p>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-slate-600" aria-label={`Matches for ${group.name}`}>
                                                    <thead className="bg-slate-800">
                                                        <tr>
                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                                Match
                                                            </th>
                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                                Player 1
                                                            </th>
                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                                Player 2
                                                            </th>
                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                                Score
                                                            </th>
                                                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-slate-700 divide-y divide-slate-600">
                                                        {displayMatches // Use displayMatches here
                                                            .filter(match => // Still need to filter matches for the current group
                                                                match.groupName === group.name && // Ensure match belongs to this group
                                                                group.playerIds.includes(match.player1Id) && group.playerIds.includes(match.player2Id)
                                                            )
                                                            .map(match => {
                                                                const isWalkoverP1 = match.status === 'completed' && match.score1 === 1 && match.score2 === 0;
                                                                const isWalkoverP2 = match.status === 'completed' && match.score1 === 0 && match.score2 === 1;
                                                                const isDisqualifiedMatch = match.status === 'completed' && match.score1 === 0 && match.score2 === 0;
                                                                const isRegularCompleted = match.status === 'completed' && !isWalkoverP1 && !isWalkoverP2 && !isDisqualifiedMatch;

                                                                let rowBorderClass = '';
                                                                if (isDisqualifiedMatch) {
                                                                    rowBorderClass = 'border-l-4 border-red-500';
                                                                } else if (isWalkoverP1 || isWalkoverP2) {
                                                                    rowBorderClass = 'border-l-4 border-yellow-500';
                                                                } else if (isRegularCompleted) {
                                                                    rowBorderClass = 'border-l-4 border-green-500';
                                                                }

                                                                // Determine status text and color based on specific conditions
                                                                let statusText = match.status.charAt(0).toUpperCase() + match.status.slice(1).replace(/_/g, ' ');
                                                                let statusColorClass = 'bg-slate-600'; // Default for scheduled

                                                                if (isDisqualifiedMatch) {
                                                                    statusText = 'Disqualified';
                                                                    statusColorClass = 'bg-red-600';
                                                                } else if (isWalkoverP1) {
                                                                    statusText = 'Walkover (P1)';
                                                                    statusColorClass = 'bg-yellow-600';
                                                                } else if (isWalkoverP2) {
                                                                    statusText = 'Walkover (P2)';
                                                                    statusColorClass = 'bg-yellow-600';
                                                                } else if (isRegularCompleted) {
                                                                    statusText = 'Completed';
                                                                    statusColorClass = 'bg-green-600';
                                                                } else if (match.status === 'in-progress') {
                                                                    statusColorClass = 'bg-sky-600';
                                                                }


                                                                const scoreDisplay = () => {
                                                                    if (isWalkoverP1) return <span className="font-bold text-yellow-300">1 - 0 (Walkover P1)</span>;
                                                                    if (isWalkoverP2) return <span className="font-bold text-yellow-300">0 - 1 (Walkover P2)</span>;
                                                                    if (isDisqualifiedMatch) return <span className="font-bold text-red-300">0 - 0 (Disqualified)</span>;
                                                                    if (isRegularCompleted && match.score1 !== null && match.score2 !== null) return <span className="font-bold text-green-300">{match.score1} - {match.score2}</span>;
                                                                    return 'N/A';
                                                                };

                                                                return (
                                                                    <tr key={match.id} className={`hover:bg-slate-600 ${rowBorderClass}`}>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-200">
                                                                            {getPlayerName(match.player1Id)} vs {getPlayerName(match.player2Id)}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                                                                            {getPlayerName(match.player1Id)}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                                                                            {getPlayerName(match.player2Id)}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                                            {scoreDisplay()}
                                                                        </td>
                                                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${statusColorClass}`}>
                                                                                {statusText}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};