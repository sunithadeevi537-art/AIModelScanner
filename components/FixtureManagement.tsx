// components/FixtureManagement.tsx
import React, { useState, useCallback, useEffect, useRef } from 'https://esm.sh/react@18';
import { CategoryFixture, Player, PlayerCategory, TournamentSettings, TournamentType, Match, MatchHistoryEntry } from '../types.ts';

interface FixtureManagementProps {
    players: Player[];
    tournamentSettings: TournamentSettings;
    fixtures: CategoryFixture[];
    onGenerateFixtures: (category: PlayerCategory, type: TournamentType) => void;
    onUpdateScore: (matchId: string, score1Value: number | null, score2Value: number | null, fieldToUpdate: 'score1' | 'score2' | 'status', statusValue?: string | null) => void;
    onUploadCustomFixtures: (fixtures: CategoryFixture[]) => void;
}

export const FixtureManagement: React.FC<FixtureManagementProps> = ({ players, tournamentSettings, fixtures, onGenerateFixtures, onUpdateScore, onUploadCustomFixtures }) => {
    const [selectedCategory, setSelectedCategory] = useState<PlayerCategory | null>(tournamentSettings.categories[0] || null);
    const [selectedType, setSelectedType] = useState<TournamentType | null>(tournamentSettings.types[0] || null);
    const customFixtureFileInputRef = useRef<HTMLInputElement>(null);

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [currentMatchHistory, setCurrentMatchHistory] = useState<MatchHistoryEntry[]>([]);
    const [currentMatchDetails, setCurrentMatchDetails] = useState<{ player1Name: string; player2Name: string } | null>(null);

    useEffect(() => {
        if (tournamentSettings.categories.length > 0 && (!selectedCategory || !tournamentSettings.categories.includes(selectedCategory))) {
            setSelectedCategory(tournamentSettings.categories[0]);
        } else if (tournamentSettings.categories.length === 0) {
            setSelectedCategory(null);
        }
        if (tournamentSettings.types.length > 0 && (!selectedType || !tournamentSettings.types.includes(selectedType))) {
            setSelectedType(tournamentSettings.types[0]);
        } else if (tournamentSettings.types.length === 0) {
            setSelectedType(null);
        }
    }, [tournamentSettings, selectedCategory, selectedType]);

    const getPlayerName = useCallback((playerId: string) => {
        const player = players.find(p => p.id === playerId);
        return player ? player.name : `Unknown Player (${playerId.substring(0,4)})`;
    }, [players]);

    const handleCustomFixtureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonString = event.target?.result as string;
                    const customFixtures = JSON.parse(jsonString);
                    // Basic validation for custom fixtures structure
                    if (Array.isArray(customFixtures) && customFixtures.every((f: CategoryFixture) => f.category && f.tournamentType && Array.isArray(f.groups) && Array.isArray(f.matches))) {
                        onUploadCustomFixtures(customFixtures);
                        alert('Custom fixtures uploaded successfully!');
                    } else {
                        alert('Invalid custom fixture JSON format. Please ensure it matches the expected structure: Array of { category, tournamentType, groups: [], matches: [] }');
                    }
                } catch (error: any) {
                    alert('Error parsing custom fixture JSON: ' + error.message);
                } finally {
                    if (customFixtureFileInputRef.current) {
                        customFixtureFileInputRef.current.value = '';
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    const currentCategoryFixtures = fixtures.filter(f =>
        f.category === selectedCategory && f.tournamentType === selectedType
    );

    const handleViewHistory = (match: Match, player1Name: string, player2Name: string) => {
        setCurrentMatchHistory(match.history);
        setCurrentMatchDetails({ player1Name, player2Name });
        setShowHistoryModal(true);
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Fixture & Score Management</h3>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                    <label htmlFor="selectCategory" className="block text-slate-300 text-sm font-bold mb-2">Select Category</label>
                    <select
                        id="selectCategory"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value as PlayerCategory)}
                        className="block w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white sm:text-sm"
                        aria-label="Select Category for Fixtures"
                        disabled={tournamentSettings.categories.length === 0}
                    >
                        {tournamentSettings.categories.length === 0 ? (
                            <option value="">No categories defined</option>
                        ) : (
                            tournamentSettings.categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))
                        )}
                    </select>
                </div>
                <div className="flex-1">
                    <label htmlFor="selectType" className="block text-slate-300 text-sm font-bold mb-2">Select Type</label>
                    <select
                        id="selectType"
                        value={selectedType || ''}
                        onChange={(e) => setSelectedType(e.target.value as TournamentType)}
                        className="block w-full py-2 px-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white sm:text-sm"
                        aria-label="Select Tournament Type for Fixtures"
                        disabled={tournamentSettings.types.length === 0}
                    >
                        {tournamentSettings.types.length === 0 ? (
                            <option value="">No types defined</option>
                        ) : (
                            tournamentSettings.types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))
                        )}
                    </select>
                </div>
            </div>


            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <button
                    onClick={() => onGenerateFixtures(selectedCategory as PlayerCategory, selectedType as TournamentType)}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedCategory || !selectedType || players.length === 0}
                    aria-label="Generate Fixtures"
                >
                    Generate Fixtures
                </button>
                <div className="flex-1">
                    <label htmlFor="customFixtureUpload" className="sr-only">Upload Custom Fixtures</label>
                    <input
                        type="file"
                        id="customFixtureUpload"
                        accept=".json"
                        onChange={handleCustomFixtureUpload}
                        ref={customFixtureFileInputRef}
                        className="block w-full text-sm text-slate-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-slate-600 file:text-white
                            hover:file:bg-slate-700
                            bg-slate-700 rounded-lg cursor-pointer transition-colors"
                        aria-label="Upload Custom Fixtures JSON"
                    />
                    <p className="text-xs text-slate-500 mt-1">Upload JSON for custom fixtures for selected category/type</p>
                </div>
            </div>

            {(tournamentSettings.categories.length === 0 || tournamentSettings.types.length === 0) ? (
                <p className="text-red-400 italic">Please define tournament types and categories in settings before managing fixtures.</p>
            ) : players.length === 0 ? (
                <p className="text-red-400 italic">Please add players before generating fixtures.</p>
            ) : currentCategoryFixtures.length === 0 ? (
                <p className="text-slate-400">No fixtures generated or uploaded for this category/type yet. Click 'Generate Fixtures' or 'Upload Custom Fixtures'.</p>
            ) : (
                currentCategoryFixtures.map(catFix => (
                    <div key={`${catFix.category}-${catFix.tournamentType}`} className="space-y-6">
                        <h4 className="text-lg font-semibold text-slate-200 mb-2">{catFix.category} - {catFix.tournamentType} Fixtures</h4>
                        {catFix.groups.map(group => (
                            <div key={group.id} className="bg-slate-700 p-4 rounded-lg">
                                <h5 className="font-bold text-slate-100 mb-3">{group.name}</h5>
                                <p className="text-sm text-slate-300 mb-4">Players: {group.playerIds.map(getPlayerName).join(', ')}</p>
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
                                                    Score (P1 - P2)
                                                </th>
                                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-slate-700 divide-y divide-slate-600">
                                            {catFix.matches
                                                .filter(match =>
                                                    group.playerIds.includes(match.player1Id) && group.playerIds.includes(match.player2Id)
                                                )
                                                .map(match => {
                                                    const disableScoreInputs = match.status === 'completed';
                                                    return (
                                                        <tr key={match.id} className="hover:bg-slate-600">
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
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className="w-16 bg-slate-600 text-slate-200 text-center rounded-md text-sm py-1 px-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        value={match.score1 === null ? '' : match.score1}
                                                                        onChange={(e) => onUpdateScore(match.id, parseInt(e.target.value), match.score2, 'score1')}
                                                                        aria-label={`Score for ${getPlayerName(match.player1Id)}`}
                                                                        disabled={disableScoreInputs}
                                                                    />
                                                                    <span>-</span>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className="w-16 bg-slate-600 text-slate-200 text-center rounded-md text-sm py-1 px-1 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        value={match.score2 === null ? '' : match.score2}
                                                                        onChange={(e) => onUpdateScore(match.id, match.score1, parseInt(e.target.value), 'score2')}
                                                                        aria-label={`Score for ${getPlayerName(match.player2Id)}`}
                                                                        disabled={disableScoreInputs}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300 capitalize">
                                                                {match.status.replace(/_/g, ' ')}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end">
                                                                <select
                                                                    value={match.status}
                                                                    onChange={(e) => onUpdateScore(match.id, match.score1, match.score2, 'status', e.target.value)}
                                                                    className="bg-slate-600 text-slate-200 rounded-md text-sm py-1 px-2 focus:ring-sky-500 focus:border-sky-500"
                                                                    aria-label={`Update status for match ${getPlayerName(match.player1Id)} vs ${getPlayerName(match.player2Id)}`}
                                                                >
                                                                    <option value="scheduled">Scheduled</option>
                                                                    <option value="in-progress">In-Progress</option>
                                                                    <option value="completed">Completed</option>
                                                                    <option value="walkover_p1">Walkover (P1)</option>
                                                                    <option value="walkover_p2">Walkover (P2)</option>
                                                                    <option value="disqualified">Disqualified</option>
                                                                </select>
                                                                <button
                                                                    onClick={() => handleViewHistory(match, getPlayerName(match.player1Id), getPlayerName(match.player2Id))}
                                                                    className="text-sky-400 hover:text-sky-300 text-xs ml-2 py-1 px-2 bg-slate-700 rounded-md"
                                                                    aria-label={`View history for match ${getPlayerName(match.player1Id)} vs ${getPlayerName(match.player2Id)}`}
                                                                >
                                                                    History
                                                                </button>
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
                ))
            )}

            {showHistoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold text-slate-100">
                                Match History: {currentMatchDetails?.player1Name} vs {currentMatchDetails?.player2Name}
                            </h4>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="text-slate-400 hover:text-slate-200"
                                aria-label="Close history modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {currentMatchHistory.length === 0 ? (
                            <p className="text-slate-400">No history available for this match.</p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg shadow">
                                <table className="min-w-full divide-y divide-slate-700">
                                    <thead className="bg-slate-900">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Timestamp</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Changed By</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Old State</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">New State</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-slate-700 divide-y divide-slate-600">
                                        {currentMatchHistory.map((log, index) => (
                                            <tr key={index} className="hover:bg-slate-600">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-200">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-300">{log.changedBy}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-300">
                                                    P1: {log.oldScore1 ?? 'N/A'}, P2: {log.oldScore2 ?? 'N/A'} <br /> Status: {log.oldStatus.replace(/_/g, ' ')}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-300">
                                                    P1: {log.newScore1 ?? 'N/A'}, P2: {log.newScore2 ?? 'N/A'} <br /> Status: {log.newStatus.replace(/_/g, ' ')}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-slate-300">{log.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};