import { Injectable } from '@angular/core';
import { DayEntry, Tournament, TournamentDay, Event, DayEntryGroup } from './tournament-model';
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

  private init() {
    this.currentTournament = {
      id: '1',
      name: 'test',
      days: [],
      events: [
        {name: 'OneMinWarning',   soundFile: 'assets/1min_warning.mp3', text: "One minute warning"},
        {name: 'StartGame',       soundFile: 'assets/hooter.mp3',        text: "Hooter Start Game"},
        {name: 'EndFirstHalf',    soundFile: 'assets/hooter.mp3',        text: "End of First Half"},
        {name: 'StartSecondHalf', soundFile: 'assets/hooter.mp3',        text: "Start of Second Half"},
        {name: 'EndSecondHalf',   soundFile: 'assets/hooter.mp3',        text: "End of Second Half"},
        {name: 'StartDropOff',    soundFile: 'assets/hooter.mp3',        text: "Start of drop off"},
        {name: 'DropOff2min',     soundFile: 'assets/hooter.mp3',        text: "Start of drop off"},
      ],
      owners: []
    };
    for(let j=0; j<3; j++) {
      this.currentTournament.days.push({ name: 'Day ' + (j+1), day: moment(new Date()).add(j, 'day').toDate(), groups: [] });
      let time = moment(this.currentTournament.days[j].day).hours(7).minutes(55).seconds(0).milliseconds(0).toDate();
      const nbGames = (Math.random() * 8) + 8;
      for(let i=0; i<nbGames; i++) {
        time = this.addGame(this.currentTournament, this.currentTournament.days[j], time);
      }
    }
  }

  public addGame(tournament: Tournament, day: TournamentDay, beginTime: Date) {
    const gameTime = moment(beginTime).add(5, 'minutes').toDate()
    const group: DayEntryGroup = {
      entries: [],
      groupName: `Game ${this.to2digit(gameTime.getHours())}:${this.to2digit(gameTime.getMinutes())}`,
      order: day.groups.length
    }
    day.groups.push(group);
    let time: Date = beginTime;
    const name2event: Map<string, Event> = new Map();
    tournament.events.forEach(e => name2event.set(e.name, e));
    time = this.addGameEntry(name2event, group, day, time,  4, 'Pre match').endTime;
    time = this.addGameEntry(name2event, group, day, time,  1, 'Pre match - One Minute Warning', 'OneMinWarning', undefined).endTime;
    time = this.addGameEntry(name2event, group, day, time, 20, 'First Half', 'StartGame').endTime;
    time = this.addGameEntry(name2event, group, day, time,  4, 'Break', 'EndFirstHalf').endTime;
    time = this.addGameEntry(name2event, group, day, time,  1, 'Break - One Minute Warning', 'OneMinWarning').endTime;
    time = this.addGameEntry(name2event, group, day, time, 20, 'Second Half', 'StartSecondHalf', 'EndSecondHalf').endTime;
    return time;
  }
  private to2digit(num:any): string {
    let str = '00' + num;
    return str.substring(str.length-2, str.length)
  }
  public addGameEntry(name2event: Map<string, Event>, group: DayEntryGroup, day: TournamentDay, 
      beginTime: Date, duration: number, nameSuffix: string,  beginEventName: string|undefined = undefined, 
      endEventName: string|undefined = undefined): DayEntry {
    const entry: DayEntry = { 
      name: nameSuffix,
      order: group.entries.length, 
      beginTime, 
      duration,
      endTime: moment(beginTime).add(duration, 'minutes').toDate()
    };
    if (beginEventName) {
      entry.beginEvent = name2event.get(beginEventName);
      if (entry.beginEvent) entry.beginEventName = beginEventName;
    }
    if (endEventName) {
      entry.endEvent = name2event.get(endEventName);
      if (entry.endEvent) entry.endEventName = entry.endEvent.name;
    }
    group.entries.push(entry);
    return entry;
  }

  public getCurrentTournament(): Tournament|undefined {
    if (!this.currentTournament) {
      if (this.tournaments.length > 0) {
        this.currentTournament = this.tournaments[0];
      }
    }
    return this.currentTournament;
  }
}
