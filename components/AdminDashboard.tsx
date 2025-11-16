// components/AdminDashboard.tsx
import React, { useCallback } from 'https://esm.sh/react@18';
import { TournamentData, TournamentSettings, Player, CategoryFixture, PlayerCategory, TournamentType, Match } from '../types.ts';
import { TournamentSetup } from './TournamentSetup.tsx';
import { PlayerManagement } from './PlayerManagement.tsx'; // Import PlayerManagement
import { FixtureManagement } from './FixtureManagement.tsx';
import { generateUUID, groupPlayersRandomly, generateRoundRobinMatches, exportToCsv } from '../utils.ts';

interface AdminDashboardProps {
    tournamentData: TournamentData;
    setTournamentData: React.Dispatch<React.SetStateAction<TournamentData>>;
    onPublish: () => void;
    isPublishing: boolean;
    setIsPublishing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ tournamentData, setTournamentData, onPublish, isPublishing, setIsPublishing }) => {
    
    const saveTournamentSettings = (newSettings: TournamentSettings) => {
        setTournamentData(prev => ({ ...prev, settings: newSettings }));
    };

    // Handlers for PlayerManagement
    const addPlayer = (newPlayer: Player) => {
        setTournamentData(prev => ({ ...prev, players: [...prev.players, newPlayer] }));
    };

    const addPlayersFromCsv = (newPlayers: Player[]) => {
        setTournamentData(prev => {
            // This handles duplicates by mobile number that might occur if CSV contains duplicates or existing players
            const uniqueNewPlayers: Player[] = [];
            const existingMobiles = new Set(prev.players.map(p => p.mobile));
            
            newPlayers.forEach(np => {
                if (!existingMobiles.has(np.mobile)) {
                    uniqueNewPlayers.push(np);
                    existingMobiles.add(np.mobile); // Add to temp set for current batch
                }
            });
            return { ...prev, players: [...prev.players, ...uniqueNewPlayers] };
        });
    };

    const updatePlayer = (updatedPlayer: Player) => {
        setTournamentData(prev => ({
            ...prev,
            players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
        }));
    };

    const deletePlayer = (playerId: string) => {
        if (window.confirm('Are you sure you want to delete this player? This will also remove them from any generated fixtures.')) {
            setTournamentData(prev => ({
                ...prev,
                players: prev.players.filter(p => p.id !== playerId),
                // Also remove player from any existing fixtures
                fixtures: prev.fixtures.map(catFix => ({
                    ...catFix,
                    groups: catFix.groups.map(group => ({
                        ...group,
                        playerIds: group.playerIds.filter(id => id !== playerId)
                    })).filter(group => group.playerIds.length >= 2), // Remove groups that become too small
                    matches: catFix.matches.filter(match => match.player1Id !== playerId && match.player2Id !== playerId)
                })).filter(catFix => catFix.groups.length > 0) // Remove categories without any valid groups
            }));
            alert('Player deleted successfully!');
        }
    };


    const generateFixtures = (category: PlayerCategory, type: TournamentType) => {
        if (!category || !type) {
            alert('Please select a category and tournament type to generate fixtures.');
            return;
        }

        const playersForCategoryAndType = tournamentData.players.filter(p =>
            p.categories.includes(category)
        );

        // Minimum 4 players to form a group of 4-6
        const MIN_GROUP_SIZE = 4; 
        const MAX_GROUP_SIZE = 6;

        if (playersForCategoryAndType.length < MIN_GROUP_SIZE) { 
            alert(`Not enough players for category "${category}" and type "${type}". Need at least ${MIN_GROUP_SIZE} players. Found: ${playersForCategoryAndType.length}`);
            return;
        }
        
        const playerIdsForGrouping = playersForCategoryAndType.map(p => p.id);

        const grouped = groupPlayersRandomly({[category]: {[type]: playerIdsForGrouping}}, MIN_GROUP_SIZE, MAX_GROUP_SIZE);
        const groupsForCurrentCategoryType = grouped[category][type];

        if (!groupsForCurrentCategoryType || groupsForCurrentCategoryType.length === 0) {
             alert(`Could not form valid groups for category "${category}" and type "${type}" with ${playersForCategoryAndType.length} players (min: ${MIN_GROUP_SIZE}, max: ${MAX_GROUP_SIZE}). Consider adjusting player count.`);
             return;
        }

        const matchesForCategoryType: Match[] = [];
        groupsForCurrentCategoryType.forEach(group => {
            const groupMatches = generateRoundRobinMatches(group.playerIds, category, type, group.name);
            matchesForCategoryType.push(...groupMatches);
        });

        const newCategoryFixture: CategoryFixture = {
            category: category,
            tournamentType: type,
            groups: groupsForCurrentCategoryType,
            matches: matchesForCategoryType,
        };

        // Merge with existing fixtures, update or add.
        setTournamentData(prev => {
            const existingFixtures = prev.fixtures.filter(f => !(f.category === category && f.tournamentType === type));
            return { ...prev, fixtures: [...existingFixtures, newCategoryFixture] };
        });
        alert('Fixtures generated successfully! Now, click "Publish Tournament to Players" at the bottom to make them visible!');
    };

    const uploadCustomFixtures = (customFixtures: CategoryFixture[]) => {
         setTournamentData(prev => {
            // Filter out existing fixtures for the same category/type as in customFixtures
            const filteredExistingFixtures = prev.fixtures.filter(existingF =>
                !customFixtures.some(customF =>
                    customF.category === existingF.category && customF.tournamentType === existingF.tournamentType
                )
            );
            
            // Ensure history array exists for each match in uploaded custom fixtures
            const processedCustomFixtures = customFixtures.map(catFix => ({
                ...catFix,
                matches: catFix.matches.map(match => ({
                    history: match.history || [], // Ensure history exists
                    ...match
                }))
            }));

            return { ...prev, fixtures: [...filteredExistingFixtures, ...processedCustomFixtures] };
        });
    };


    const updateScore = (matchId: string, score1Value: number | null, score2Value: number | null, fieldToUpdate: 'score1' | 'score2' | 'status', statusValue: string | null = null) => {
        setTournamentData(prev => ({
            ...prev,
            fixtures: prev.fixtures.map(catFix => ({
                ...catFix,
                matches: catFix.matches.map(match => {
                    if (match.id === matchId) {
                        const oldScore1 = match.score1;
                        const oldScore2 = match.score2;
                        const oldStatus = match.status;

                        let newScore1 = match.score1;
                        let newScore2 = match.score2;
                        let newStatus: Match['status'] = match.status;

                        if (fieldToUpdate === 'score1') {
                            newScore1 = (score1Value === null || isNaN(score1Value)) ? null : Math.max(0, parseInt(score1Value.toString()));
                        } else if (fieldToUpdate === 'score2') {
                            newScore2 = (score2Value === null || isNaN(score2Value)) ? null : Math.max(0, parseInt(score2Value.toString()));
                        } else if (fieldToUpdate === 'status' && statusValue) {
                            newStatus = statusValue as Match['status'];
                        }

                        // Apply special status logic immediately when status changes
                        if (fieldToUpdate === 'status') {
                            if (newStatus === 'walkover_p1') {
                                newScore1 = 1;
                                newScore2 = 0;
                                newStatus = 'completed'; // Mark as completed
                            } else if (newStatus === 'walkover_p2') {
                                newScore1 = 0;
                                newScore2 = 1;
                                newStatus = 'completed'; // Mark as completed
                            } else if (newStatus === 'disqualified') {
                                newScore1 = 0;
                                newScore2 = 0;
                                newStatus = 'completed'; // Mark as completed
                            } else if (newStatus === 'scheduled' || newStatus === 'in-progress') {
                                // If status is changed back to non-completed, clear scores
                                newScore1 = null;
                                newScore2 = null;
                            }
                        }

                        // Validation for "Completed" status (including auto-completed ones)
                        if (newStatus === 'completed' && (newScore1 === null || newScore2 === null || isNaN(newScore1) || isNaN(newScore2))) {
                            alert('Scores are required for both players when marking a match as "Completed".');
                            return match; // Revert to original match if validation fails
                        }
                        
                        // Check if any significant change occurred to log it
                        const scoresChanged = oldScore1 !== newScore1 || oldScore2 !== newScore2;
                        const statusChanged = oldStatus !== newStatus;

                        if (scoresChanged || statusChanged) {
                            const logEntry = {
                                timestamp: new Date().toISOString(),
                                changedBy: 'Admin', // Assuming only admin can make changes via this UI
                                oldScore1: oldScore1,
                                oldScore2: oldScore2,
                                oldStatus: oldStatus,
                                newScore1: newScore1,
                                newScore2: newScore2,
                                newStatus: newStatus,
                                reason: fieldToUpdate === 'status' ? `Status changed to ${newStatus.replace(/_/g, ' ').toUpperCase()}` : 'Scores updated',
                            };
                            return {
                                ...match,
                                score1: newScore1,
                                score2: newScore2,
                                status: newStatus,
                                history: [...match.history, logEntry],
                            };
                        }
                        // If no changes, return the original match object
                        return match;
                    }
                    return match;
                })
            }))
        }));
    };

    const handlePublishClick = async () => {
        // Removed window.confirm as per previous user request. Publish directly.
        console.log('AdminDashboard: handlePublishClick - Initiating publish process.');
        setIsPublishing(true); // Start loading state
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call or heavy operation
            onPublish(); // This updates tournamentData.isPublished in App
            alert('Tournament successfully published to players!'); // Success message after publish
        } catch (error) {
            console.error("Failed to publish tournament:", error);
            alert("Failed to publish tournament. Please try again.");
        } finally {
            setIsPublishing(false); // End loading state
        }
    };

    // Helper to get player name by ID for CSV exports
    const getPlayerNameForExport = useCallback((playerId: string) => {
        const player = tournamentData.players.find(p => p.id === playerId);
        return player ? player.name : `Unknown Player (ID: ${playerId ? playerId.substring(0, 4) : 'N/A'})`;
    }, [tournamentData.players]);

    const exportPlayersData = () => {
        if (tournamentData.players.length === 0) {
            alert('No players to export.');
            return;
        }
        const headers = ["Player ID", "Name", "Mobile Number", "Category 1", "Category 2", "Fee Paid"];
        const rows = [headers];

        tournamentData.players.forEach(player => {
            rows.push([
                player.id,
                player.name,
                player.mobile,
                player.categories[0] || '',
                player.categories[1] || '',
                player.feePaid ? 'Yes' : 'No'
            ]);
        });
        exportToCsv('players_data.csv', rows);
    };

    const exportFixturesData = () => {
        if (tournamentData.fixtures.length === 0) {
            alert('No fixtures to export.');
            return;
        }
        const headers = ["Category", "Tournament Type", "Group ID", "Group Name", "Players in Group (Names)", "Players in Group (IDs)"];
        const rows = [headers];

        tournamentData.fixtures.forEach(catFix => {
            catFix.groups.forEach(group => {
                rows.push([
                    catFix.category,
                    catFix.tournamentType,
                    group.id,
                    group.name,
                    group.playerIds.map(getPlayerNameForExport).join('; '), // Semicolon as separator for readability
                    group.playerIds.join('; ')
                ]);
            });
        });
        exportToCsv('fixtures_groups_data.csv', rows);
    };

    const exportMatchResultsData = () => {
        let allMatches: Match[] = [];
        tournamentData.fixtures.forEach(catFix => {
            allMatches.push(...catFix.matches);
        });

        if (allMatches.length === 0) {
            alert('No match results to export.');
            return;
        }

        const headers = ["Match ID", "Category", "Tournament Type", "Group Name", "Player 1 Name", "Player 2 Name", "Score Player 1", "Score Player 2", "Status"];
        const rows = [headers];

        allMatches.forEach(match => {
            rows.push([
                match.id,
                match.category,
                match.tournamentType,
                match.groupName,
                getPlayerNameForExport(match.player1Id),
                getPlayerNameForExport(match.player2Id),
                match.score1 === null ? '' : match.score1,
                match.score2 === null ? '' : match.score2,
                match.status.replace(/_/g, ' ') // Format status for readability
            ]);
        });
        exportToCsv('match_results_data.csv', rows);
    };


    const canPublish = tournamentData.settings.name.trim() !== '' &&
                               tournamentData.settings.types.length > 0 &&
                               tournamentData.settings.categories.length > 0 &&
                               tournamentData.players.length > 0 &&
                               tournamentData.fixtures.length > 0;

    const publishDisabledReason = !tournamentData.settings.name.trim() ? 'Complete tournament name in settings.' :
                                          tournamentData.settings.types.length === 0 ? 'Select tournament types in settings.' :
                                          tournamentData.settings.categories.length === 0 ? 'Select player categories in settings.' :
                                          tournamentData.players.length === 0 ? 'Add players.' :
                                          tournamentData.fixtures.length === 0 ? 'Generate or upload fixtures.' :
                                          '';

    return (
        <div className="space-y-8">
            <TournamentSetup settings={tournamentData.settings} onSaveSettings={saveTournamentSettings} />
            {/* Player Management Section */}
            <PlayerManagement
                players={tournamentData.players}
                tournamentSettings={tournamentData.settings}
                onAddPlayer={addPlayer}
                onUpdatePlayer={updatePlayer}
                onDeletePlayer={deletePlayer}
                onAddPlayersFromCsv={addPlayersFromCsv}
            />
            <FixtureManagement
                players={tournamentData.players}
                tournamentSettings={tournamentData.settings}
                fixtures={tournamentData.fixtures}
                onGenerateFixtures={generateFixtures}
                onUpdateScore={updateScore}
                onUploadCustomFixtures={uploadCustomFixtures}
            />
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
                <h3 className="text-xl font-semibold text-slate-100 mb-4">Export Data</h3>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={exportPlayersData}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={tournamentData.players.length === 0}
                        aria-label="Export Player Information to CSV"
                    >
                        Export Players to CSV
                    </button>
                    <button
                        onClick={exportFixturesData}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={tournamentData.fixtures.length === 0}
                        aria-label="Export Fixtures to CSV"
                    >
                        Export Fixtures to CSV
                    </button>
                    <button
                        onClick={exportMatchResultsData}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={tournamentData.fixtures.length === 0}
                        aria-label="Export Match Results to CSV"
                    >
                        Export Match Results to CSV
                    </button>
                </div>
            </div>

            <button
                onClick={handlePublishClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Publish Tournament"
                disabled={!canPublish || isPublishing}
            >
                {isPublishing ? 'Publishing...' : 'Publish Tournament to Players'}
            </button>
            {!canPublish && publishDisabledReason && (
                <p className="text-red-400 text-sm text-center" role="status">
                    Cannot publish: {publishDisabledReason}
                </p>
            )}
        </div>
    );
};