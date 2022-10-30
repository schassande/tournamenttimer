import { Component, Input, OnInit } from '@angular/core';
import { DayEntryGroup, Pattern, TournamentDay } from '../tournament-model';
import * as moment from 'moment';
import { TournamentService } from '../tournament-service';

@Component({
  selector: 'app-day-editor',
  templateUrl: './day-editor.component.html',
  styleUrls: ['./day-editor.component.css']
})
export class DayEditorComponent implements OnInit {
  
  @Input() day: TournamentDay|undefined;
  @Input() patterns: Pattern[] = [];

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
  }

  deleteGroup(idx: number) {
    console.log('deleteGroup: ', this.day?.groups[0]);
    this.day?.groups.splice(idx, 1);
  }

  patternChanged(groupIdx: number, event: any) {
    if (!this.day) return;
    const group = this.day.groups[groupIdx];
    group.pattern = this.patterns[event.target.selectedIndex];
    this.tournamentService.rebuildEntriesFromPattern(group);
    this.recomputeTimes(groupIdx, this.getOfficialTime(groupIdx));    
  }

  getFirstTime(): string {
    return moment(this.day?.firstTimeSlot).format('HH:mm');
  }

  setFirstTime(val: string) {
    if (!this.day) return;
    this.day.firstTimeSlot = this.parse(val);
    this.recomputeTimes(0, this.parse(val));
  }

  getGroupTime(group: DayEntryGroup) {
    const delay = group.pattern.entries.map(e => e.duration)
      .reduce((prev, cur, idx) => idx < group.pattern.nbEntryPreOfficialTime ? prev + cur : prev);
    return moment(group.entries[0].beginTime).add(delay, 'minutes').format('HH:mm');
  }

  setGroupTime(groupIdx: number, timeSlot: string) {
    this.recomputeTimes(groupIdx, this.parse(timeSlot));
  }

  addTimeSlot() {
    if (!this.day) return;
    const pattern = this.day.groups.length > 0 ? this.day.groups[this.day.groups.length-1].pattern : this.patterns[0];
    this.tournamentService.addGroupFromPattern(this.day, pattern);
  }

  private recomputeTimes(groupIdx: number, newOfficialTime: Date): boolean {
    if (!this.day) return false;
    if (groupIdx > 0) {
      // check the new official time is compatible with previous slot
      const group = this.day.groups[groupIdx];
      const previousGroup = this.day.groups[groupIdx - 1];
      const newBeginTime = moment(newOfficialTime).add(-this.getPreOfficialTimeDuration(group), 'minutes');
      const previousSlotEndTime = moment(previousGroup.entries[previousGroup.entries.length - 1].endTime);
      if (newBeginTime.isBefore(previousSlotEndTime)) {
          console.log('newBeginTime=' + newBeginTime.toDate())
          console.log('previousSlotEndTime=' + previousSlotEndTime.toDate())
          return false;
      }
    }
    let previousEndTime: Date;
    for(let idx = groupIdx; idx < this.day.groups.length; idx++) {
      let group = this.day.groups[idx];
      if (groupIdx === idx) {
        // first group to recompute
        if (idx === 0) {
        // first group of the day
        this.day.firstTimeSlot = newOfficialTime;
        }
        const delay = this.getPreOfficialTimeDuration(group);
        previousEndTime = moment(newOfficialTime).add(-delay, 'minutes').toDate();
      }
      group.entries.forEach(entry => {
        entry.beginTime = previousEndTime;
        entry.endTime = moment(entry.beginTime).add(entry.duration, 'minutes').toDate();
        previousEndTime = entry.endTime;
      });
      group.groupName = this.tournamentService.computeGroupName(group.pattern, this.getOfficialTime(idx));
    }
    return true;
  }

  private parse(str: string): Date {
    const parts = str.split(':');
    return moment(this.day?.day)
      .hours(Number.parseInt(parts[0], 10))
      .minutes(Number.parseInt(parts[1], 10))
      .toDate()
  }

  private getOfficialTime(groupIdx: number): Date {
    if (!this.day) return new Date();
    const group = this.day.groups[groupIdx];
    const delay = this.getPreOfficialTimeDuration(group);
    return moment(group.entries[0].beginTime).add(delay, 'minutes').toDate();
  }

  private getPreOfficialTimeDuration(group: DayEntryGroup): number {
    return group.entries.map(e => e.duration)
      .reduce((prev, cur, idx) => idx < group.pattern.nbEntryPreOfficialTime ? prev + cur : prev);
  }
}
