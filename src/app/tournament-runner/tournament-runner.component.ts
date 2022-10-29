import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { TournamentService } from '../tournament-service';
import {Tournament, TournamentDay } from '../tournament-model';
import {MatExpansionPanel} from '@angular/material/expansion';

@Component({
  selector: 'app-tournament-runner',
  templateUrl: './tournament-runner.component.html',
  styleUrls: ['./tournament-runner.component.css']
})
export class TournamentRunnerComponent implements OnInit {

  tournament: Tournament|undefined;
  day: TournamentDay|undefined;
  currentGroupEntryIdx = -1;
  currentEntryIdx = -1;
  playing = false;
  message = '';
  @ViewChildren('groups') groups: QueryList<MatExpansionPanel>|undefined

  constructor(private tournamentService: TournamentService) { }

  ngOnInit(): void {
    console.log('TournamentRunnerComponent.ngOnInit()');
    this.tournament = this.tournamentService.getCurrentTournament();
    if (this.tournament) {
      this.day = this.tournament.days[0];
      if (this.day && this.day.groups && this.day.groups.length) {
        this.currentGroupEntryIdx = 0;
        this.computeEntryIndex();
      }
    } else {
      console.log('No tournament')
    }
    this.onlyCurrentExpanded();
  }
  computeEntryIndex() {
    if (this.day && this.day.groups[this.currentGroupEntryIdx] 
      && this.day.groups[this.currentGroupEntryIdx].entries 
      && this.day.groups[this.currentGroupEntryIdx].entries.length) {
      this.currentEntryIdx = 0;
    }
  }
  playGroup(groupIdx: number, event: any) {
    event.stopPropagation();
    this.currentGroupEntryIdx = groupIdx; 
    this.computeEntryIndex();
    this.playEntry();
  
  }
  previousGroup() {
    if (!this.day) return;
    if (this.currentGroupEntryIdx > 0) {
      this.currentGroupEntryIdx--;
      this.computeEntryIndex();
      this.playEntry();
    }
  }
  nextGroup() {
    if (!this.day) return;
    if (this.currentGroupEntryIdx < this.day.groups.length -1) {
      this.currentGroupEntryIdx++;
      this.computeEntryIndex();
      this.playEntry();
    }
  }
  previousEntry() {
    if (!this.day) return;
    if (this.currentEntryIdx === 0) {
      this.previousGroup();
    } else {
      this.stopEntry();
      this.currentEntryIdx --;
      this.playEntry();
    }
  }
  nextEntry() {
    if (!this.day) return;
    if (this.currentEntryIdx === this.day.groups[this.currentGroupEntryIdx].entries.length -1) {
      this.nextGroup();
    } else {
      this.stopEntry();
      this.currentEntryIdx ++;
      this.playEntry();
    }

  }
  playEntry(groupIdx: number = this.currentGroupEntryIdx, entryIdx: number = this.currentEntryIdx) {
    this.currentGroupEntryIdx = groupIdx;
    this.currentEntryIdx = entryIdx;
    if (!this.day) return;
    this.playing = true;
    this.message = this.day.groups[this.currentGroupEntryIdx].entries[this.currentEntryIdx].name;
    this.onlyCurrentExpanded();
  }
  onlyCurrentExpanded() {
    console.log('currentGroupEntryIdx='+this.currentGroupEntryIdx)
    console.log('groups:' + this.groups)
    this.groups?.forEach((g,idx) => {
      console.log('groups['+idx+'].isOpen' + g.expanded)
      if (idx === this.currentGroupEntryIdx) {
        g.open();
      } else {
        g.close()
      }
    })
  }
  stopEntry() {
    this.playing = false;
    this.message = '';
  }
}
