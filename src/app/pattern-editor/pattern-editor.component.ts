import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Event, Pattern, PatternEntry } from '../tournament-model';
import { TournamentService } from '../tournament-service';

@Component({
  selector: 'app-pattern-editor',
  templateUrl: './pattern-editor.component.html',
  styleUrls: ['./pattern-editor.component.css']
})
export class PatternEditorComponent implements OnChanges {

  @Input() pattern: Pattern|undefined;
  @Input() events: Event[]|undefined;
  @Output() onDelete: EventEmitter<Pattern> = new EventEmitter<Pattern>();
  
  
  currentEntry: PatternEntry|undefined;
  currentEntryIdx = -1;

  constructor(private tournamentService: TournamentService) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.computeCurrentEntry();
  }
  
  private computeCurrentEntry() {
    if (this.pattern && this.pattern.entries.length > 0) {
      if (this.currentEntryIdx < 0 || this.currentEntryIdx >= this.pattern.entries.length) {
        this.currentEntryIdx = 0;
      }
      this.currentEntry = this.pattern.entries[this.currentEntryIdx];
    } else {
      this.currentEntryIdx = -1;
    }
  }

  computePatternDuration(): void {
    if (this.pattern) {
      const prev = this.pattern.duration;
      this.tournamentService.computePatternDuration(this.pattern);
      if (prev !== this.pattern.duration) {
        this.tournamentService.onPatternChange.emit(this.pattern);
      }
    }
  }

  entrySelected(entry: PatternEntry, idx: number) {
    this.currentEntry = entry;
    this.currentEntryIdx = idx;
  }

  entryDurationChanged() {
    this.computePatternDuration();
  }
  newEntry() {
    if (!this.pattern) return;
    this.currentEntry = this.tournamentService.createPatternEntry(this.pattern);
    this.computePatternDuration();
  }

  deleteEntry(idx: number) {
    if (!this.pattern) return;
    this.pattern.entries.splice(idx, 1);
    this.computePatternDuration();
  }
  beginEventChanged() {
    if (!this.currentEntry) return;
    if (this.currentEntry.beginEvent) this.currentEntry.beginEventName = this.currentEntry.beginEvent.name;
  }
  endEventChanged() {
    if (!this.currentEntry) return;
    if (this.currentEntry.endEvent) this.currentEntry.endEventName = this.currentEntry.endEvent.name;
  }
  deletePattern() {
    this.onDelete.emit(this.pattern);
    this.tournamentService.onPatternChange.emit(this.pattern);
  }
  setCurrentEntryAsOfficialStartTime() {
    if (this.pattern && this.currentEntryIdx >= 0) {
      console.log("setCurrentEntryAsOfficialStartTime:" + this.currentEntryIdx);
      this.pattern.nbEntryPreOfficialTime = this.currentEntryIdx;
      this.tournamentService.onPatternChange.emit(this.pattern);
    }
  }
}
