import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Event, Pattern, PatternEntry } from '../tournament-model';
import { TournamentService } from '../tournament-service';

@Component({
  selector: 'app-pattern-editor',
  templateUrl: './pattern-editor.component.html',
  styleUrls: ['./pattern-editor.component.css']
})
export class PatternEditorComponent implements OnInit {

  @Input() pattern: Pattern|undefined;
  @Input() events: Event[]|undefined;
  @Output() onDelete: EventEmitter<Pattern> = new EventEmitter<Pattern>();

  currentEntry: PatternEntry|undefined;

  constructor(private tournamentService: TournamentService) { }

  ngOnInit(): void {
  }

  entrySelected(entry: PatternEntry) {
    this.currentEntry = entry;
  }

  newEntry() {
    if (!this.pattern) return;
    this.currentEntry = this.tournamentService.createPatternEntry(this.pattern);
  }

  deleteEntry(idx: number) {
    if (!this.pattern) return;
    this.pattern.entries.splice(idx, 1);
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
  }
}
