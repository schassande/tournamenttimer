import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Tournament } from '../tournament-model';
import { TournamentService } from '../tournament-service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tournament-editor',
  templateUrl: './tournament-editor.component.html',
  styleUrls: ['./tournament-editor.component.css']
})
export class TournamentEditorComponent implements OnInit {

  tournament: Tournament|undefined;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private tournamentService: TournamentService) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params: ParamMap) => {
        const tournamentId: string|null = params.get('tournamentId')
        if (tournamentId) {
          this.tournament = this.tournamentService.getTournament(tournamentId);
          if (!this.tournament || this.tournament.days.length === 0) {
            this.router.navigateByUrl('/home');
            return;
          }
        } else {
          this.tournament = this.tournamentService.createTournament();
        }
      })
    ).subscribe();
  }
  addDay() {
    if (!this.tournament) return;
    this.tournamentService.createDay(this.tournament);
  }
  deleteDay(dayIdx: number) {
    if (!this.tournament) return;
    this.tournament.days.splice(dayIdx, 1);
  }
  exportTournament() {
    
  }
}
