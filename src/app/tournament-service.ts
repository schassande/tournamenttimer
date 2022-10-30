import { Injectable } from '@angular/core';
import { DayEntry, Tournament, TournamentDay, Event, DayEntryGroup, Pattern, PatternEntry } from './tournament-model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  public tournaments: Tournament[] = [];

  private currentTournament: Tournament|undefined;

  public constructor() {
    this.init();
  }

  public addPatternEntry(pattern: Pattern, 
                         events: Event[], 
                         duration: number, 
                         name: string, 
                         beginEventName: string|undefined = undefined, 
                         endEventName: string|undefined = undefined) {
    const entry: PatternEntry = {name, duration};
    if (beginEventName) {
      entry.beginEventName = beginEventName;
      entry.beginEvent = events.find(ev => ev.name === beginEventName);
      // console.log(pattern.name + '/' + entry.name + ': ' + beginEventName + '=>' + entry.beginEvent?.name);
    }
    if (endEventName) {
      entry.endEventName = endEventName;
      entry.endEvent = events.find(ev => ev.name === endEventName);
      // console.log(pattern.name + '/' + entry.name + ': ' + endEventName + '=>' + entry.endEvent?.name);
    }
    pattern.entries.push(entry);
  }

  public computeGroupName(pattern: Pattern, officialTime: Date): string {
    return pattern.groupNamePrefix + this.to2digit(officialTime.getHours()) + ':' + this.to2digit(officialTime.getMinutes());
  }
  public addGroupFromPattern(day: TournamentDay, pattern: Pattern) {
    let officialTime: Date;
    let time: Date;
    const delay = pattern.entries.map(e => e.duration)
      .reduce((prev, cur, idx) => idx < pattern.nbEntryPreOfficialTime ? prev + cur : prev);
    if (day.groups.length > 0 && day.groups[day.groups.length-1].entries.length > 0) { 
      // additionnal slot of the day
      const lastGroup = day.groups[day.groups.length-1];
      time = lastGroup.entries[lastGroup.entries.length-1].endTime;
      officialTime = moment(time).add(delay, 'minutes').toDate();
    } else {
      // first slot of the day
      officialTime = day.firstTimeSlot;
      time = moment(officialTime).add(-delay, 'minutes').toDate();
    }
    const group: DayEntryGroup = {
      entries: [],
      groupName: this.computeGroupName(pattern, officialTime),
      order: day.groups.length,
      pattern: pattern
    };
    this.rebuildEntriesFromPattern(group, time);
    day.groups.push(group);
  }  

  public rebuildEntriesFromPattern(group: DayEntryGroup, _time:Date|undefined = undefined) {
    let time = _time ? _time : group.entries[0].beginTime;
    group.entries = group.pattern.entries.map(patternEntry => {
      const entry: DayEntry = { 
        name: patternEntry.name,
        order: group.entries.length, 
        beginTime: time, 
        duration: patternEntry.duration,
        endTime: moment(time).add(patternEntry.duration, 'minutes').toDate()
      };
      entry.beginEvent = patternEntry.beginEvent;
      entry.beginEventName = patternEntry.beginEventName;
      entry.endEvent = patternEntry.endEvent;
      entry.endEventName = patternEntry.endEventName;
      group.entries.push(entry);
      time = entry.endTime;
      return entry;
    });
  }

  public getTournament(tournamenId: string): Tournament|undefined {
    return this.tournaments.find(t => t.id === tournamenId);
  }

  public getCurrentTournament(): Tournament|undefined {
    if (!this.currentTournament) {
      if (this.tournaments.length > 0) {
        this.currentTournament = this.tournaments[0];
      }
    }
    return this.currentTournament;
  }

  public setCurrentTournament(tournament: Tournament|undefined) {
    this.currentTournament = tournament;
  }

  public generateId(): string {
    return new Date().getTime() + '' + Math.floor(Math.random() * 10000000);
  }

  public createTournament(): Tournament {
    return {
      id: this.generateId(),
      name: '',
      days: [],
      events: [
      ],
      patterns: [],
      owners: []
    };
  }

  public createDay(tournament: Tournament): TournamentDay {
    let dayDate: Date;
    if (tournament.days.length > 0) {
      // Use the next day
      dayDate = tournament.days[tournament.days.length-1].day;
      dayDate = moment(dayDate).add(1, 'day').toDate();
    } else {
      // use today
      dayDate = new Date();
    }
    let firstTimeSlot: Date;
    if (tournament.days.length > 0) {
      // use the same first time slot of the previous day
      firstTimeSlot = moment(tournament.days[tournament.days.length-1].day).add(1, 'day').toDate()
    } else {
      // use 08h00 as default value
      firstTimeSlot = moment(dayDate).hours(8).minutes(0).seconds(0).milliseconds(0).toDate();
    }
    const day : TournamentDay = { 
      name: 'Day ' + (tournament.days.length+1),
      day: dayDate,
      groups: [],
      firstTimeSlot
    };
    tournament.days.push(day);
    return day;
  }

  public createPattern(patterns: Pattern[]): Pattern {
    const pattern: Pattern = { 
      id: this.generateId(),
      name: 'Game type ' + (patterns.length + 1),
      entries: [],
      groupNamePrefix: 'Game-',
      nbEntryPreOfficialTime: 0
    };
    patterns.push(pattern);
    return pattern;
  }

  public createPatternEntry(pattern: Pattern): PatternEntry {
    const entry: PatternEntry = { name: 'Entry ' + (pattern.entries.length+1), duration: 1 };
    pattern.entries.push(entry);
    return entry;
  }

  private to2digit(num:any): string {
    let str = '00' + num;
    return str.substring(str.length-2, str.length)
  }

  public setTouchGameEventsAndPatterns(tournament: Tournament) {
    tournament.events = [
      {name: 'OneMinWarning',   soundFile: 'assets/1min_warning.mp3',  text: "One minute warning"},
      {name: 'StartGame',       soundFile: 'assets/hooter.mp3',        text: "Hooter Start Game"},
      {name: 'EndFirstHalf',    soundFile: 'assets/hooter.mp3',        text: "End of First Half"},
      {name: 'StartSecondHalf', soundFile: 'assets/hooter.mp3',        text: "Start of Second Half"},
      {name: 'EndSecondHalf',   soundFile: 'assets/hooter.mp3',        text: "End of Second Half"},
      {name: 'StartDropOff',    soundFile: 'assets/hooter.mp3',        text: "Start of drop off"},
      {name: 'DropOff2min',     soundFile: 'assets/hooter.mp3',        text: "2min Drop off "},
    ]
    const events = tournament.events;
    {
      const pattern = { id: '1', name:'2x20min Game', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 2};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 4, 'Pre match');
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'Second Half', 'StartSecondHalf', 'EndSecondHalf');
    }
    {
      const pattern = { id: '2', name:'2x20min Game RR', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 2};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 4, 'Pre match');
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'Second Half', 'StartSecondHalf');
      this.addPatternEntry(pattern, events, 1, 'Before DropOff', 'EndSecondHalf');
      this.addPatternEntry(pattern, events, 2, 'First DropOff', 'StartDropOff');
      this.addPatternEntry(pattern, events, 7, 'Second DropOff', 'DropOff2min');
    }
  }

  private init() {
    const tournament: Tournament = {
      id: '1',
      name: 'My Touch tournament',
      days: [],
      events: [],
      patterns: [],
      owners: []
    };
    this.setTouchGameEventsAndPatterns(tournament);
    for(let j=0; j<3; j++) {
      const day:TournamentDay = this.createDay(tournament);
      day.firstTimeSlot = moment(day.day).hours(8).minutes(0).seconds(0).milliseconds(0).toDate();
      const nbGames = (Math.random() * 8) + 8;
      for(let i=0; i<nbGames; i++) {
        const patternIdx = Math.floor(Math.random() * 100) % tournament.patterns.length;
        this.addGroupFromPattern(day, tournament.patterns[patternIdx]);
      }
    }
    this.tournaments.push(tournament);
    this.currentTournament = tournament
  }
}
