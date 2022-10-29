import { Component, OnInit } from '@angular/core';
import { Tournament } from '../tournament-model';
import { TournamentService } from '../tournament-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tournaments: Tournament[] = [];

  constructor(private tournamentService: TournamentService) { }

  ngOnInit(): void {
    this.tournaments = this.tournamentService.tournaments;
  }
}
