// types.ts

export enum TournamentType {
    MEN_SINGLES = 'Men Singles',
    MEN_DOUBLES = 'Men Doubles',
    WOMEN_SINGLES = 'Women Singles',
    WOMEN_DOUBLES = 'Women Doubles',
    MIXED_DOUBLES = 'Mixed Doubles',
}

export enum PlayerCategory {
    OPEN = 'Open',
    THIRTY_PLUS = '30+',
    FORTY_PLUS = '40+',
    FIFTY_PLUS = '50+',
    SIXTY_PLUS = '60+',
    SEVENTY_PLUS = '70+',
}

export interface Player {
    id: string;
    name: string;
    mobile: string;
    categories: PlayerCategory[];
    feePaid: boolean;
}

export interface MatchHistoryEntry {
    timestamp: string;
    changedBy: string;
    oldScore1: number | null;
    oldScore2: number | null;
    oldStatus: string;
    newScore1: number | null;
    newScore2: number | null;
    newStatus: string;
    reason: string;
}

export interface Match {
    id: string;
    category: PlayerCategory;
    tournamentType: TournamentType;
    groupName: string;
    player1Id: string;
    player2Id: string;
    score1: number | null;
    score2: number | null;
    status: 'scheduled' | 'in-progress' | 'completed' | 'walkover_p1' | 'walkover_p2' | 'disqualified';
    history: MatchHistoryEntry[];
}

export interface Group {
    id: string;
    name: string;
    playerIds: string[];
}

export interface CategoryFixture {
    category: PlayerCategory;
    tournamentType: TournamentType;
    groups: Group[];
    matches: Match[];
}

export interface TournamentSettings {
    name: string;
    types: TournamentType[];
    categories: PlayerCategory[];
}

export interface TournamentData {
    settings: TournamentSettings;
    players: Player[];
    fixtures: CategoryFixture[];
    isPublished: boolean;
}