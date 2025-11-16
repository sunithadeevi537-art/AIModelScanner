// components/TournamentSetup.tsx
import React, { useState, useEffect } from 'https://esm.sh/react@18';
import { TournamentSettings, TournamentType, PlayerCategory } from '../types.ts';

interface TournamentSetupProps {
    settings: TournamentSettings;
    onSaveSettings: (settings: TournamentSettings) => void;
}

export const TournamentSetup: React.FC<TournamentSetupProps> = ({ settings, onSaveSettings }) => {
    const [tournamentName, setTournamentName] = useState(settings?.name || '');
    const [selectedTypes, setSelectedTypes] = useState(settings?.types || []);
    const [selectedCategories, setSelectedCategories] = useState(settings?.categories || []);

    useEffect(() => {
        setTournamentName(settings?.name || '');
        setSelectedTypes(settings?.types || []);
        setSelectedCategories(settings?.categories || []);
    }, [settings]);

    const handleTypeChange = (type: TournamentType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleCategoryChange = (category: PlayerCategory) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tournamentName.trim() === '') {
            alert('Tournament Name cannot be empty.');
            return;
        }
        if (selectedTypes.length === 0) {
            alert('Please select at least one Tournament Type.');
            return;
        }
        if (selectedCategories.length === 0) {
            alert('Please select at least one Player Category.');
            return;
        }
        onSaveSettings({
            name: tournamentName,
            types: selectedTypes,
            categories: selectedCategories,
        });
        alert('Tournament settings saved!');
    };

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">Tournament Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="tournamentName" className="block text-slate-300 text-sm font-bold mb-2">
                        Tournament Name
                    </label>
                    <input
                        type="text"
                        id="tournamentName"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-200 leading-tight focus:outline-none focus:shadow-outline bg-slate-700 border-slate-600 focus:border-sky-500 focus:ring-sky-500"
                        value={tournamentName}
                        onChange={(e) => setTournamentName(e.target.value)}
                        required
                        aria-required="true"
                        aria-label="Tournament Name"
                    />
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">
                        Tournament Types <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-labelledby="tournament-types-label">
                        {Object.values(TournamentType).map(type => (
                            <label key={type} className="flex items-center text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={selectedTypes.includes(type)}
                                    onChange={() => handleTypeChange(type)}
                                    className="form-checkbox h-4 w-4 text-sky-600 bg-slate-700 border-slate-600 rounded focus:ring-sky-500"
                                    aria-label={type}
                                />
                                <span className="ml-2 text-sm">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">
                        Player Categories <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-labelledby="player-categories-label">
                        {Object.values(PlayerCategory).map(category => (
                            <label key={category} className="flex items-center text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                    className="form-checkbox h-4 w-4 text-sky-600 bg-slate-700 border-slate-600 rounded focus:ring-sky-500"
                                    aria-label={category}
                                />
                                <span className="ml-2 text-sm">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                    aria-label="Save Tournament Settings"
                >
                    Save Tournament Settings
                </button>
            </form>
        </div>
    );
};