export interface Tournament {
    id: string;
    name: string;
    owners: string[];
    days: TournamentDay[];
    events: Event[];
}

export interface TournamentDay {
    name: string;
    day: Date;
    groups: DayEntryGroup[];
}
export interface DayEntryGroup {
    order?: number;
    groupName: string;
    entries: DayEntry[];
}
export interface DayEntry {
    name: string;
    order?: number;
    beginTime: Date;
    beginEvent?: Event;
    beginEventName?: string;
    endTime: Date;
    endEvent?: Event;
    endEventName?: string;
    duration: number;
}

export interface Event {
    name: string;
    soundFile: string|null;
    text: string;
}