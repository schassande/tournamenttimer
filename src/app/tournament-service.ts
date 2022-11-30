import { EventEmitter } from '@angular/core';
import { Injectable } from '@angular/core';
import { DayEntry, Tournament, TournamentDay, Event, DayEntryGroup, Pattern, PatternEntry } from './tournament-model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  public tournaments: Tournament[] = [];

  private currentTournament: Tournament|undefined;
  public onPatternChange: EventEmitter<Pattern> = new EventEmitter

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
      // A console.log(pattern.name + '/' + entry.name + ': ' + beginEventName + '=>' + entry.beginEvent?.name);
    }
    if (endEventName) {
      entry.endEventName = endEventName;
      entry.endEvent = events.find(ev => ev.name === endEventName);
      // A console.log(pattern.name + '/' + entry.name + ': ' + endEventName + '=>' + entry.endEvent?.name);
    }
    pattern.entries.push(entry);
    this.computePatternDuration(pattern);
  }
  public computePatternDuration(pattern: Pattern|undefined) {
    if (pattern) {
      if (pattern.entries.length === 0) {
        pattern.duration = 0
      } else if (pattern.entries.length === 1) {
        pattern.duration = pattern.entries[0].duration;
      } else {
        pattern.duration = pattern.entries.map(e => e.duration).reduce((a,b) => a + b);
      }
    }
  }

  public computeGroupName(pattern: Pattern, officialTime: Date): string {
    return pattern.groupNamePrefix + this.to2digit(officialTime.getHours()) + ':' + this.to2digit(officialTime.getMinutes());
  }
  public addGroupFromPattern(day: TournamentDay, pattern: Pattern, pos: number = -1): DayEntryGroup {
    let officialTime: Date;
    let time: Date;
    const delay = pattern.entries.map(e => e.duration)
      .reduce((prev, cur, idx) => idx < pattern.nbEntryPreOfficialTime ? prev + cur : prev);
    if (pos > day.groups.length || pos < 0) {
      pos = day.groups.length;
    }
    if (pos === 0) {
      // first slot of the day
      officialTime = day.firstTimeSlot;
      time = moment(officialTime).add(-delay, 'minutes').toDate();
    } else {
      let lastIdxWithEndTime = pos-1;
      while(lastIdxWithEndTime >= 0 && day.groups[lastIdxWithEndTime].entries.length === 0) pos--;
      // additionnal slot of the day
      const lastGroup = day.groups[lastIdxWithEndTime];
      time = lastGroup.entries[lastGroup.entries.length-1].endTime;
      officialTime = moment(time).add(delay, 'minutes').toDate();
    }
    const group: DayEntryGroup = {
      entries: [],
      groupName: this.computeGroupName(pattern, officialTime),
      order: day.groups.length,
      pattern: pattern,
      officialTime: moment(officialTime).format('HH:mm')
    };
    this.rebuildEntriesFromPattern(group, time);
    day.groups.splice(pos, 0, group);
    return group;
  }
  public recomputeAllTimes(day: TournamentDay) {
    if (!day || day.groups.length === 0) return;
    let previousEndTimeSlot = moment(day.firstTimeSlot).add(-this.getPreOfficialTimeDuration(day.groups[0]), 'minutes');
    day.groups.forEach((group, groupIdx) => {
      group.officialTime = moment(previousEndTimeSlot).add(this.getPreOfficialTimeDuration(group), 'minutes').format('HH:mm');
      group.entries.forEach(entry => {
        entry.beginTime = previousEndTimeSlot.toDate();
        const endTime = moment(entry.beginTime).add(entry.duration, 'minutes');
        entry.endTime = endTime.toDate();
        previousEndTimeSlot = endTime;
      });
      group.groupName = this.computeGroupName(group.pattern, this.getOfficialTime(day, groupIdx));
    });
  }
  public getOfficialTime(day: TournamentDay, groupIdx: number): Date {
    if (!day) return new Date();
    const group = day.groups[groupIdx];
    const delay = this.getPreOfficialTimeDuration(group);
    return moment(group.entries[0].beginTime).add(delay, 'minutes').toDate();
  }

  public getPreOfficialTimeDuration(group: DayEntryGroup): number {
    return group.entries
      .map((e,idx) => idx < group.pattern.nbEntryPreOfficialTime ? e.duration : 0)
      .reduce((prev, cur) =>  prev + cur);
  }

  computeGroupOfficialTime(group: DayEntryGroup) {
    const delay = group.pattern.entries.map(e => e.duration)
      .reduce((prev, cur, idx) => idx < group.pattern.nbEntryPreOfficialTime ? prev + cur : prev);
    group.officialTime = moment(group.entries[0].beginTime).add(delay, 'minutes').format('HH:mm');
  }

 

  public rebuildEntriesFromPattern(group: DayEntryGroup, _time:Date|undefined = undefined) {
    let time = _time ? _time : group.entries[0].beginTime;
    group.entries = group.pattern.entries.map(patternEntry => {
      const entry: DayEntry = { 
        name: patternEntry.name,
        order: group.entries.length, 
        beginTime: time, 
        beginEvent : patternEntry.beginEvent,
        beginEventName : patternEntry.beginEventName,
        duration: patternEntry.duration,
        endTime: moment(time).add(patternEntry.duration, 'minutes').toDate(),
        endEvent : patternEntry.endEvent,
        endEventName : patternEntry.endEventName
      };
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
      nbEntryPreOfficialTime: 0,
      duration: 0
    };
    patterns.push(pattern);
    return pattern;
  }

  public duplicatePattern(sourcePattern: Pattern, patterns: Pattern[]): Pattern {
    const pattern: Pattern = { 
      id: this.generateId(),
      duration: sourcePattern.duration,
      name: sourcePattern.name + ' Copy ' + Math.floor(Math.random() * 100),
      entries: sourcePattern.entries.map(e => { return { ...e }; }),
      groupNamePrefix: sourcePattern.groupNamePrefix,
      nbEntryPreOfficialTime: sourcePattern.nbEntryPreOfficialTime
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
      const pattern = { id: '1', name:'50min: 2x20min Game', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'Second Half', 'StartSecondHalf', 'EndSecondHalf');
      this.addPatternEntry(pattern, events, 4, 'Post match');
    }
    {
      const pattern = { id: '2', name:'60min: 2x20min Game RR', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'Second Half', 'StartSecondHalf');
      this.addPatternEntry(pattern, events, 1, 'Before DropOff', 'EndSecondHalf');
      this.addPatternEntry(pattern, events, 2, 'First DropOff', 'StartDropOff');
      this.addPatternEntry(pattern, events, 7, 'Second DropOff', 'DropOff2min');
      this.addPatternEntry(pattern, events, 4, 'Post match');
    }
    {
      const pattern = { id: '3', name:'40min: 2x15min Game', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,15, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,15, 'Second Half', 'StartSecondHalf', 'EndSecondHalf');
      this.addPatternEntry(pattern, events, 4, 'Post match');
    }
    {
      const pattern = { id: '4', name:'45min: 2x15min Game RR', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,15, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,15, 'Second Half', 'StartSecondHalf', 'EndSecondHalf');
      this.addPatternEntry(pattern, events, 9, 'Post match');
    }
    {
      const pattern = { id: '5', name:'35min: 2x12min Game', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,12, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,12, 'Second Half', 'StartSecondHalf', 'EndSecondHalf');
      this.addPatternEntry(pattern, events, 5, 'Post match');
    }
    {
      const pattern = { id: '6', name:'30min: 2x10min Game', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,10, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 2, 'Break', 'EndFirstHalf');
      this.addPatternEntry(pattern, events, 1, 'Break - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,10, 'Second Half', 'StartSecondHalf', 'EndSecondHalf');
      this.addPatternEntry(pattern, events, 6, 'Post match');
    }
    {
      const pattern = { id: '7', name:'30min: 1x25min Game', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,25, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 4, 'Post match');
    }
    {
      const pattern = { id: '8', name:'30min: 1x20min Game', entries: [], groupNamePrefix: 'Game-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Pre match - One Minute Warning', 'OneMinWarning');
      this.addPatternEntry(pattern, events,20, 'First Half', 'StartGame');
      this.addPatternEntry(pattern, events, 9, 'Post match');
    }
    const breakLengths = [1, 5, 10, 15, 20, 25, 30, 60];
    for(let idx = 0; idx < breakLengths.length; idx ++) {
      const pattern = { id: '' + (10 + idx), name:'Break ' + breakLengths[idx] +'min', 
        entries: [], groupNamePrefix: 'Break-', nbEntryPreOfficialTime: 1, duration: 0};
      tournament.patterns.push(pattern);
      this.addPatternEntry(pattern, events, 1, 'Common Break');
      if (breakLengths[idx] > 1) {
        this.addPatternEntry(pattern, events, breakLengths[idx] - 1, 'Break');
      }
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
      const nbGames = (Math.random() * 4) + 8;
      for(let i=0; i<nbGames; i++) {
        const patternIdx = Math.floor(Math.random() * 10000) % Math.min(tournament.patterns.length, 8);
        this.addGroupFromPattern(day, tournament.patterns[patternIdx]);
      }
    }
    this.tournaments.push(tournament);
    this.currentTournament = tournament
  }
}
