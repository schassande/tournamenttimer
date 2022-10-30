import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Tournament } from '../tournament-model';
import { TournamentService } from '../tournament-service';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tournaments: Tournament[] = [];
  @ViewChild('inputFile') inputFile: ElementRef|undefined;

  constructor(private router: Router,
    private tournamentService: TournamentService) { }

  ngOnInit(): void {
    this.tournaments = this.tournamentService.tournaments;
  }

  run(tournament: Tournament) {
    this.tournamentService.setCurrentTournament(tournament);
    this.router.navigate(['/run']);
  }
  edit(tournament: Tournament){
    this.tournamentService.setCurrentTournament(tournament);
    this.router.navigate(['/edit']);
  }
  duplicate(tournament: Tournament){
    const newTournament = JSON.parse(JSON.stringify(tournament));
    newTournament.name = "Copy of " + newTournament.name;
    this.tournamentService.tournaments.push(newTournament);
  }
  create(){
    this.tournamentService.setCurrentTournament(undefined);
    this.router.navigate(['/edit']);
  }
  loadFile() {
    if (this.inputFile) this.inputFile.nativeElement.click();
  }
  importTournament(event:any) {
    console.log(event.target.files[0]);
    const reader: FileReader = new FileReader();
    reader.onloadend = () => {
      const tournament: Tournament = JSON.parse(reader.result as string) as Tournament;
      this.tournamentService.tournaments.push(tournament);
    };
    reader.readAsText(event.target.files[0]);
  }
  exportTournament(tournament: Tournament) {
    const content: string = JSON.stringify(tournament, null, 2);
    const oMyBlob = new Blob([content], {type : 'application/json'});
    const url = URL.createObjectURL(oMyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TournamentTimer_${tournament.name}_${moment(new Date()).format('YYYYMMDD-hhmm')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
  deleteTournament(tournamentIdx: number) {
    this.tournaments.splice(tournamentIdx, 1);
  }
}
