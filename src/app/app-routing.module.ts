import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TournamentEditorComponent } from './tournament-editor/tournament-editor.component';
import { TournamentRunnerComponent } from './tournament-runner/tournament-runner.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'run/:tournamentId', component: TournamentRunnerComponent},
  { path: 'edit/:tournamentId', component: TournamentEditorComponent},
  { path: 'create', component: TournamentEditorComponent},
  { path: '**', redirectTo:'/home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
