// components/PlayerManagement.tsx
import React, { useState, useRef, useEffect, useCallback } from 'https://esm.sh/react@18';
import { Player, PlayerCategory, TournamentSettings } from '../types.ts';
import { generateUUID, parseCsv } from '../utils.ts';

interface PlayerManagementProps {
    players: Player[];
    tournamentSettings: TournamentSettings;
    onAddPlayer: (player: Player) => void;
    onUpdatePlayer: (player: Player) => void;
    onDeletePlayer: (playerId: string) => void;
    onAddPlayersFromCsv: (players: Player[]) => void;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
    players,
    tournamentSettings,
    onAddPlayer,
    onUpdatePlayer,
    onDeletePlayer,
    onAddPlayersFromCsv,
}) => {
    const [playerName, setPlayerName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [selectedPlayerCategories, setSelectedPlayerCategories] = useState<PlayerCategory[]>([]);
    const [feePaid, setFeePaid] = useState(false);
    const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
    const csvFileInputRef = useRef<HTMLInputElement>(null);

    const PLAYER_LIMIT_PER_CATEGORY = 50; // Define a reasonable limit for players per category

    // Define groupedPlayers and categoryPlayerCounts here, derived from `players` prop
    const groupedPlayers: { [mobile: string]: Player[] } = players.reduce((acc: { [mobile: string]: Player[] }, player) => {
        if (!acc[player.mobile]) {
            acc[player.mobile] = [];
        }
        acc[player.mobile].push(player);
        return acc;
    }, {});

    const categoryPlayerCounts: { [category: string]: number } = tournamentSettings.categories.reduce((acc: { [category: string]: number }, category) => {
        acc[category] = players.filter(p => p.categories.includes(category)).length;
        return acc;
    }, {});

    const categoriesOverLimit = Object.entries(categoryPlayerCounts).filter(([, count]) => count > PLAYER_LIMIT_PER_CATEGORY);

    const handlePlayerCategoryChange = (category: PlayerCategory) => {
        setSelectedPlayerCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else if (prev.length < 2) { // Max 2 categories
                return [...prev, category];
            }
            return prev;
        });
    };

    const resetForm = () => {
        setPlayerName('');
        setMobileNumber('');
        setSelectedPlayerCategories([]);
        setFeePaid(false);
        setEditPlayerId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerName || !mobileNumber || selectedPlayerCategories.length === 0) {
            alert('Please fill in all player details and select at least one category.');
            return;
        }
        if (selectedPlayerCategories.some(cat => !tournamentSettings.categories.includes(cat))) {
            alert('One or more selected categories are not defined in tournament settings. Please update tournament settings or select valid categories.');
            return;
        }


        const playerWithSameMobile = players.find(p => p.mobile === mobileNumber && p.id !== editPlayerId);
        if (playerWithSameMobile) {
            alert('A player with this mobile number already exists. Please use a unique mobile number or edit the existing player.');
            return;
        }

        if (editPlayerId) {
            onUpdatePlayer({
                id: editPlayerId,
                name: playerName,
                mobile: mobileNumber,
                categories: selectedPlayerCategories,
                feePaid: feePaid,
            });
            alert('Player updated successfully!');
        } else {
            onAddPlayer({
                id: generateUUID(),
                name: playerName,
                mobile: mobileNumber,
                categories: selectedPlayerCategories,
                feePaid: feePaid,
            });
            alert('Player added successfully!');
        }
        resetForm();
    };

    const handleEdit = (player: Player) => {
        setPlayerName(player.name);
        setMobileNumber(player.mobile);
        setSelectedPlayerCategories(player.categories);
        setFeePaid(player.feePaid);
        setEditPlayerId(player.id);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to make form visible
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvString = event.target?.result as string;
                const parsedData = parseCsv(csvString);
                
                let playersToAdd: Player[] = [];
                let existingMobiles = new Set(players.map(p => p.mobile));
                
                // Define a mapping for CSV category numbers to enum values
                const csvCategoryMap: { [key: string]: PlayerCategory } = {
                    'Open': PlayerCategory.OPEN,
                    '30': PlayerCategory.THIRTY_PLUS,
                    '40': PlayerCategory.FORTY_PLUS,
                    '50': PlayerCategory.FIFTY_PLUS,
                    '60': PlayerCategory.SIXTY_PLUS,
                    '70': PlayerCategory.SEVENTY_PLUS,
                    '30+': PlayerCategory.THIRTY_PLUS, // Also handle if CSV already has '+'
                    '40+': PlayerCategory.FORTY_PLUS,
                    '50+': PlayerCategory.FIFTY_PLUS,
                    '60+': PlayerCategory.SIXTY_PLUS,
                    '70+': PlayerCategory.SEVENTY_PLUS,
                };

                parsedData.forEach(row => {
                    // Corrected to use 'MobileNumber' and 'Categories' based on the image and warnings
                    const name = row['Name'];
                    const mobile = row['MobileNumber']; 
                    const rawCategoryFromCsv = row['Categories']; 
                    const feePaidStatus = row['Paid(Y/N)']?.toUpperCase() === 'Y';

                    const categories: PlayerCategory[] = [];
                    if (rawCategoryFromCsv) {
                        // Map the raw CSV category to the actual PlayerCategory enum value
                        const mappedCategory = csvCategoryMap[rawCategoryFromCsv];

                        // Check if the mapped category is valid and included in tournament settings
                        if (mappedCategory && tournamentSettings.categories.includes(mappedCategory)) {
                            categories.push(mappedCategory);
                        } else {
                            console.warn(`Skipping category "${rawCategoryFromCsv}" from CSV: Invalid or not defined in tournament settings.`);
                        }
                    }

                    if (name && mobile && categories.length > 0) {
                        if (!existingMobiles.has(mobile)) {
                            playersToAdd.push({
                                id: generateUUID(),
                                name: name,
                                mobile: mobile,
                                categories: categories, // Will contain 0 or 1 category from CSV
                                feePaid: feePaidStatus,
                            });
                            existingMobiles.add(mobile); // Mark as added to avoid duplicates in current batch
                        } else {
                            console.warn(`Skipping player ${name} (Mobile: ${mobile}) from CSV: Mobile number already exists.`);
                        }
                    } else {
                        console.warn(`Skipping CSV row due to missing required data or invalid categories: ${JSON.stringify(row)}`);
                    }
                });

                if (playersToAdd.length > 0) {
                    onAddPlayersFromCsv(playersToAdd);
                    alert(`${playersToAdd.length} players added from CSV successfully!`);
                } else {
                    alert('No new valid players found in CSV to add or all players already exist.');
                }
                if (csvFileInputRef.current) {
                    csvFileInputRef.current.value = ''; // Clear file input
                }
            };
            reader.readAsText(file);
        }
    };
            
    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Manage Players</h3>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="playerName" className="block text-slate-300 text-sm font-bold mb-2">
                            Player Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="playerName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-200 leading-tight focus:outline-none focus:shadow-outline bg-slate-700 border-slate-600 focus:border-sky-500 focus:ring-sky-500"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            required
                            aria-required="true"
                            aria-label="Player Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="mobileNumber" className="block text-slate-300 text-sm font-bold mb-2">
                            Mobile Number <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="mobileNumber"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-200 leading-tight focus:outline-none focus:shadow-outline bg-slate-700 border-slate-600 focus:border-sky-500 focus:ring-sky-500"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            required
                            aria-required="true"
                            aria-label="Mobile Number"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">
                        Categories (max 2) <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-labelledby="player-categories-label">
                        {tournamentSettings.categories.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">Define tournament categories first in settings.</p>
                        ) : (
                            tournamentSettings.categories.map(category => (
                                <label key={category} className="flex items-center text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={selectedPlayerCategories.includes(category)}
                                        onChange={() => handlePlayerCategoryChange(category)}
                                        disabled={!selectedPlayerCategories.includes(category) && selectedPlayerCategories.length >= 2}
                                        className="form-checkbox h-4 w-4 text-sky-600 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 disabled:opacity-50"
                                        aria-label={`Category ${category}`}
                                    />
                                    <span className="ml-2 text-sm">{category}</span>
                                </label>
                            ))
                        )}
                    </div>
                    {selectedPlayerCategories.length === 0 && (
                        <p className="text-red-400 text-xs mt-1" role="alert">Please select at least one category.</p>
                    )}
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="feePaid"
                        checked={feePaid}
                        onChange={(e) => setFeePaid(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-sky-600 bg-slate-700 border-slate-600 rounded focus:ring-sky-500"
                        aria-label="Fee Paid"
                    />
                    <label htmlFor="feePaid" className="ml-2 text-slate-200 text-sm">Fee Paid</label>
                </div>

                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                        aria-label={editPlayerId ? 'Update Player' : 'Add Player'}
                    >
                        {editPlayerId ? 'Update Player' : 'Add Player'}
                    </button>
                    {editPlayerId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                            aria-label="Cancel Edit"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            <div className="mb-6">
                <label htmlFor="csvUpload" className="block text-slate-300 text-sm font-bold mb-2">
                    Upload Players via CSV
                </label>
                <input
                    type="file"
                    id="csvUpload"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    ref={csvFileInputRef}
                    className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-sky-500 file:text-white
                        hover:file:bg-sky-600
                        bg-slate-700 rounded-lg cursor-pointer transition-colors"
                    aria-label="Upload Players CSV"
                />
                <p className="text-xs text-slate-500 mt-2">Expected CSV headers: "Name", "MobileNumber", "Categories", "Paid(Y/N)". Category values like "40" or "40+" will map to "40+". Only adds new players. Players can be manually edited to add a second category if applicable.</p>
            </div>

            {categoriesOverLimit.length > 0 && (
                <div className="bg-orange-900/30 border border-orange-700 text-orange-300 p-4 rounded-md mb-6 flex items-start gap-3" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <h4 className="font-bold">Player Count Warning ({PLAYER_LIMIT_PER_CATEGORY}+ players)</h4>
                        <p>The following categories have a high number of players, which might indicate a large tournament scope or potential data management challenges for a single category:</p>
                        <ul className="list-disc list-inside mt-1">
                            {categoriesOverLimit.map(([category, count]) => (
                                <li key={category}>{category}: {count} players</li>
                            ))}
                        </ul>
                        <p className="text-sm mt-2">Consider reviewing the player list or the tournament structure if this is unexpected.</p>
                    </div>
                </div>
            )}

            <h4 className="text-lg font-semibold text-slate-200 mb-3">Registered Players</h4>
            {Object.keys(groupedPlayers).length === 0 ? (
                    <p className="text-slate-400">No players registered yet.</p>
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {Object.entries(groupedPlayers).map(([mobile, playersArr]) => (
                                <tr key={mobile} className="hover:bg-slate-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                                        {mobile}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {playersArr.map(p => p.name).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {playersArr.map(p => p.categories.join(' & ')).join('; ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {playersArr.every(p => p.feePaid) ? 'Yes' : 'No'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {playersArr.map(player => (
                                            <div key={player.id} className="flex gap-2 mb-1 last:mb-0 justify-end">
                                                <button
                                                    onClick={() => handleEdit(player)}
                                                    className="text-indigo-400 hover:text-indigo-300 text-xs"
                                                    aria-label={`Edit ${player.name}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDeletePlayer(player.id)}
                                                    className="text-red-400 hover:text-red-300 text-xs ml-2"
                                                    aria-label={`Delete ${player.name}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};