import { Component, Input, OnInit } from '@angular/core';
import { Event, Pattern } from '../tournament-model';
import { TournamentService } from '../tournament-service';

@Component({
  selector: 'app-patterns-editor',
  templateUrl: './patterns-editor.component.html',
  styleUrls: ['./patterns-editor.component.css']
})
export class PatternsEditorComponent implements OnInit {

  @Input() patterns: Pattern[] = [];
  @Input() events: Event[]|undefined;
  currentPattern: Pattern|undefined;
  currentPatternId: string|undefined;

  constructor(private tournamentService: TournamentService) { }

  ngOnInit(): void {
    this.currentPatternId = this.patterns.length > 0 ? this.patterns[0].id : undefined;
    this.patternSelected();
  }

  patternSelected() {
    this.currentPattern = this.patterns.find(p => p.id === this.currentPatternId);
  }

  newPattern() {
    this.currentPattern = this.tournamentService.createPattern(this.patterns);
    this.currentPatternId = this.currentPattern.id;
  }
  duplicatePattern() {
    if (this.currentPattern) {
      this.currentPattern = this.tournamentService.duplicatePattern(this.currentPattern, this.patterns);
      this.currentPatternId = this.currentPattern.id;
    }
  }
  deleteCurrentPattern() {
    const idx = this.patterns.findIndex(p => p.id === this.currentPatternId);
    if (idx >= 0) {
      this.patterns.splice(idx, 1);
      if (this.patterns.length === 0) {
        this.currentPattern = undefined;
        this.currentPatternId = undefined;
      } else {
        this.currentPattern = this.patterns[0];
        this.currentPatternId = this.currentPattern.id;
      }
    }
  }
}
