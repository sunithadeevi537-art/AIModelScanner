// utils.ts
import { PlayerCategory, TournamentType, Match } from './types.ts';

// --- Local Storage Keys ---
export const LS_TOURNAMENT_DATA = 'tournamentData';
export const LS_ADMIN_LOGGED_IN = 'adminLoggedIn';

// --- Helper Functions ---

// Local Storage Management
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        const parsedItem = JSON.parse(item);
        return parsedItem;
    } catch (error) {
        console.error(`[LocalStorage] Error reading or parsing from localStorage key "${key}":`, error);
        return defaultValue;
    }
};

export const setLocalStorage = (key: string, value: any) => {
    try {
        const stringifiedValue = JSON.stringify(value);
        localStorage.setItem(key, stringifiedValue);
    } catch (error) {
        console.error(`[LocalStorage] Error writing to localStorage key "${key}":`, error);
        if (error instanceof DOMException && (error.code === 22 || error.name === 'QuotaExceededError')) {
            alert('Local storage limit exceeded. Please clear some data or use a different browser.');
        } else if (error instanceof DOMException && error.name === 'SecurityError') {
            alert('Local storage access denied. Please ensure you are not in private browsing mode.');
        }
    }
};

export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// CSV Parsing (simplified for in-browser use)
export const parseCsv = (csvString: string): { [key: string]: string }[] => {
    const lines = csvString.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: { [key: string]: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
            console.warn(`Skipping malformed row: ${lines[i]} (expected ${headers.length} columns, got ${values.length})`);
            continue;
        }
        let row: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        data.push(row);
    }
    return data;
};

// Fixture Generation Logic (Round Robin)
export const generateRoundRobinMatches = (playerIds: string[], category: PlayerCategory, tournamentType: TournamentType, groupName: string): Match[] => {
    if (playerIds.length < 2) return [];
    const matches: Match[] = [];
    for (let i = 0; i < playerIds.length; i++) {
        for (let j = i + 1; j < playerIds.length; j++) {
            matches.push({
                id: generateUUID(),
                category: category,
                tournamentType: tournamentType,
                groupName: groupName,
                player1Id: playerIds[i],
                player2Id: playerIds[j],
                score1: null,
                score2: null,
                status: 'scheduled',
                history: [], // Add this for logging
            });
        }
    }
    return matches;
};

export const groupPlayersRandomly = (
    playersInCategories: { [category: string]: { [type: string]: string[] } },
    minGroupSize: number,
    maxGroupSize: number
) => {
    const finalGroupedPlayers: { [category: string]: { [type: string]: { id: string, name: string, playerIds: string[] }[] } } = {};

    for (const category in playersInCategories) {
        finalGroupedPlayers[category] = {};
        for (const type in playersInCategories[category]) {
            const playerIds = [...playersInCategories[category][type]];
            const totalPlayers = playerIds.length;

            // 1. Basic Validation: Not enough players for even one minimum-sized group
            if (totalPlayers < minGroupSize) {
                console.warn(`Not enough players for ${category} - ${type}. Need at least ${minGroupSize}, found ${totalPlayers}. Skipping grouping.`);
                finalGroupedPlayers[category][type] = [];
                continue;
            }

            // 2. Determine valid range for number of groups (k)
            const minAllowedGroups = Math.ceil(totalPlayers / maxGroupSize);
            const maxAllowedGroups = Math.floor(totalPlayers / minGroupSize);

            if (minAllowedGroups > maxAllowedGroups) {
                console.warn(`Impossible to form valid groups for ${category} - ${type} with ${totalPlayers} players (min: ${minGroupSize}, max: ${maxGroupSize}). Constraints cannot be met.`);
                finalGroupedPlayers[category][type] = [];
                continue;
            }

            // 3. Choose number of groups (k) within the valid range.
            // We choose the smallest possible number of groups (minAllowedGroups) to make groups as large as possible
            // (closer to maxGroupSize), which minimizes the total number of matches.
            const numGroups = minAllowedGroups; 
            
            const shuffledPlayerIds = playerIds.sort(() => 0.5 - Math.random()); // Simple shuffle

            const groups = Array.from({ length: numGroups }, (_, i) => ({
                id: generateUUID(),
                name: `Group ${String.fromCharCode(65 + i)}`,
                playerIds: [],
            }));

            // 4. Distribute players round-robin into the determined number of groups
            for (let i = 0; i < totalPlayers; i++) {
                groups[i % numGroups].playerIds.push(shuffledPlayerIds[i]);
            }

            // 5. Final Validation (should pass if numGroups was chosen correctly)
            const invalidGroups = groups.filter(g => g.playerIds.length < minGroupSize || g.playerIds.length > maxGroupSize);
            if (invalidGroups.length > 0) {
                console.error(`Internal Grouping Error: Groups formed outside valid size for ${category} - ${type}:`, invalidGroups);
                // This indicates a bug in the numGroups calculation or distribution logic that needs fixing.
                finalGroupedPlayers[category][type] = []; 
            } else {
                finalGroupedPlayers[category][type] = groups;
            }
        }
    }
    return finalGroupedPlayers;
};

// CSV Export utility
export const exportToCsv = (filename: string, rows: (string | number | null | undefined)[][]) => {
    const escapedRows = rows.map(row => 
        row.map(field => {
            // Ensure all fields are strings and escape commas/quotes
            const stringField = String(field === null || field === undefined ? '' : field);
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""")}"`;
            }
            return stringField;
        }).join(',')
    );
    const csvString = escapedRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
};