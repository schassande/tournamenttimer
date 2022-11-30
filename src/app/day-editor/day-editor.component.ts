import { Component, Input, OnInit } from '@angular/core';
import { DayEntryGroup, Pattern, TournamentDay } from '../tournament-model';
import * as moment from 'moment';
import { TournamentService } from '../tournament-service';

@Component({
  selector: 'app-day-editor',
  templateUrl: './day-editor.component.html',
  styleUrls: ['./day-editor.component.css']
})
export class DayEditorComponent {
  
  @Input() day: TournamentDay|undefined;
  @Input() patterns: Pattern[] = [];

  constructor(private tournamentService: TournamentService) {}

  deleteGroup(idx: number) {
    if (!this.day) return;
    this.day.groups.splice(idx, 1);
    this.tournamentService.recomputeAllTimes(this.day);    
  }

  patternChanged(groupIdx: number, patternId: string) {
    if (!this.day) return;
    const group = this.day.groups[groupIdx];
    const newPattern = this.patterns.find(p => p.id === patternId);
    if (newPattern) {
      group.pattern = newPattern;
      this.tournamentService.rebuildEntriesFromPattern(group);
      this.tournamentService.recomputeAllTimes(this.day);    
    }
  }

  getFirstTime(): string {
    return moment(this.day?.firstTimeSlot).format('HH:mm');
  }

  setFirstTime(val: string) {
    if (!this.day) return;
    this.day.firstTimeSlot = this.parse(val);
    this.tournamentService.recomputeAllTimes(this.day);
  }

  addTimeSlot(pos: number = -1) {
    if (!this.day) return;
    if (pos === -1) {
      pos = this.day.groups.length;
    }
    const pattern = this.day.groups.length === 0 
      ? this.patterns[0] 
      : (pos > 0 ? this.day.groups[pos-1].pattern : this.day.groups[pos].pattern);
    this.tournamentService.addGroupFromPattern(this.day, pattern, pos);
    this.tournamentService.recomputeAllTimes(this.day);
  }

  private parse(str: string): Date {
    const parts = str.split(':');
    return moment(this.day?.day)
      .hours(Number.parseInt(parts[0], 10))
      .minutes(Number.parseInt(parts[1], 10))
      .toDate()
  }
  getOfficialTime(groupIdx: number): Date {
    if (!this.day) return new Date();
    return this.tournamentService.getOfficialTime(this.day, groupIdx);
  }

  getPreOfficialTimeDuration(group: DayEntryGroup): number {
    return this.tournamentService.getPreOfficialTimeDuration(group);
  }
}
