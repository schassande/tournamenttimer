export interface Tournament {
    id: string;
    name: string;
    owners: string[];
    days: TournamentDay[];
    events: Event[];
    patterns: Pattern[];
}

export interface TournamentDay {
    name: string;
    day: Date;
    groups: DayEntryGroup[];
    firstTimeSlot: Date;
}
export interface DayEntryGroup {
    order?: number;
    groupName: string;
    officialTime: string;
    pattern: Pattern;
    entries: DayEntry[];
}
export interface DayEntry extends PatternEntry {
    order?: number;
    beginTime: Date;
    endTime: Date;
}

export interface Event {
    name: string;
    soundFile: string|null;
    text: string;
}

export interface Pattern {
    id: string;
    name: string;
    groupNamePrefix: string;
    entries: PatternEntry[];
    nbEntryPreOfficialTime: number;
    duration: number;
}

export interface PatternEntry {
    name: string;
    duration: number;
    beginEvent?: Event;
    beginEventName?: string;
    endEvent?: Event;
    endEventName?: string;
}
