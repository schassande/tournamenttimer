import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { TournamentService } from '../tournament-service';
import {DayEntry, Event, Tournament, TournamentDay } from '../tournament-model';
import {MatExpansionPanel} from '@angular/material/expansion';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tournament-runner',
  templateUrl: './tournament-runner.component.html',
  styleUrls: ['./tournament-runner.component.css']
})
export class TournamentRunnerComponent implements OnInit {

  tournament: Tournament|undefined;
  day: TournamentDay|undefined;
  entry: DayEntry|undefined;
  currentGroupEntryIdx = -1;
  currentEntryIdx = -1;
  playing = false;
  pausing = false;
  message = '';
  elaspedTime= 0;
  remainingTime = 0;
  @ViewChildren('groups') groups: QueryList<MatExpansionPanel>|undefined
  interval: any;
  timeout: any;
  audio: HTMLAudioElement = new Audio();
  eventMessage: string|undefined;
  mute = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params: ParamMap) => {
        const tournamentId: string|null = params.get('tournamentId')
        if (!tournamentId) {
          this.router.navigateByUrl('/home');
          return;
        }
        this.tournament = this.tournamentService.getTournament(tournamentId);
        if (!this.tournament || this.tournament.days.length === 0) {
          this.router.navigateByUrl('/home');
          return;
        }
        this.day = this.tournament.days[0];
        this.computeGroupIndex();  
      })
    ).subscribe();
  }
  computeGroupIndex() {
    if (this.day && this.day.groups && this.day.groups.length) {
      this.currentGroupEntryIdx = 0;
      this.computeEntryIndex();
    }
  }
  computeEntryIndex() {
    if (this.day && this.day.groups[this.currentGroupEntryIdx] 
      && this.day.groups[this.currentGroupEntryIdx].entries 
      && this.day.groups[this.currentGroupEntryIdx].entries.length) {
      this.currentEntryIdx = 0;
    }
  }
  dayChange(newDay:TournamentDay) {
    console.log("Day=" + this.day?.name, JSON.stringify(event));
    this.stopEntry();
    this.day = newDay;
    this.computeGroupIndex();
  }
  playGroup(groupIdx: number, event: any) {
    event.stopPropagation();
    this.stopEntry();
    this.currentGroupEntryIdx = groupIdx; 
    this.computeEntryIndex();
    this.playEntry();
  
  }
  previousGroup() {
    if (!this.day) return;
    if (this.currentGroupEntryIdx > 0) {
      this.stopEntry();
      this.currentGroupEntryIdx--;
      this.computeEntryIndex();
      this.playEntry();
    }
  }
  nextGroup() {
    if (!this.day) return;
    if (this.currentGroupEntryIdx < this.day.groups.length -1) {
      this.stopEntry();
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
    this.entry = this.day.groups[this.currentGroupEntryIdx].entries[this.currentEntryIdx]
    this.playing = true;
    if (!this.pausing) {
      this.message = this.entry.name;
      this.onlyCurrentExpanded();
      this.elaspedTime= 0;
      this.remainingTime = this.entry.duration * 60;
    }
    clearInterval(this.interval);
    this.interval = setInterval(this.updateTime.bind(this), 1000);
    if (this.entry.beginEvent) {
      this.showEventMessage(this.entry.beginEvent.text);
      if (this.entry.beginEvent.soundFile) {
        this.stopAudio();
        this.playAudio(this.entry.beginEvent.soundFile, this.entry.duration * 60);
      }
    }

  }
  updateTime() {
    if (this.playing && this.remainingTime > 0) {
      this.remainingTime--;
      this.elaspedTime++;
      if (this.remainingTime <= 0) {
        this.playing = false;
        if (this.entry?.endEvent) {
          this.showEventMessage(this.entry.endEvent.text);
          if (this.entry.endEvent.soundFile) {
            this.stopAudio();
            this.playAudio(this.entry.endEvent.soundFile);
          }
        }
        this.nextEntry();
      }
    }
  }
  onlyCurrentExpanded() {
    this.groups?.forEach((g,idx) => {
      if (idx === this.currentGroupEntryIdx) {
        if (!g.expanded) g.open();
      } else {
        if (g.expanded) g.close()
      }
    })
  }
  stopEntry() {
    this.playing = false;
    this.pausing = false;
    this.message = '';
    this.remainingTime = 0;
    this.elaspedTime = 0;
    clearInterval(this.interval);
    this.interval = undefined;
    this.stopAudio();
}
  pauseEntry() {
    this.pausing = true;
    this.playing = false;
    clearInterval(this.interval);
    this.interval = undefined;
    this.stopAudio();
  }
  stopAudio() {
    if (this.timeout) clearTimeout(this.timeout);
    this.audio.pause();
  }
  toggleMute() {
    this.mute = !this.mute;
    if (this.mute) this.stopAudio();
  }
  playAudio(fileName: string, timeout: number|undefined = undefined) {
    if (this.mute) return;
    this.stopAudio();
    this.audio.src = fileName;
    this.audio.load();
    this.audio.play();
    if (timeout) {
      this.timeout = setTimeout(() => this.audio.pause(), timeout * 1000);
    }
  }
  showEventMessage(text: string) {
    this.eventMessage = text;
    setTimeout(() => {
      this.eventMessage = undefined
    }, 5000);
  }
  playEvent(ev: Event) {
    if (ev.soundFile) {
      if (this.timeout) clearTimeout(this.timeout);
      this.audio.pause();
      this.audio.src = ev.soundFile;
      this.audio.load();
      this.audio.play();
    }
  }
}
