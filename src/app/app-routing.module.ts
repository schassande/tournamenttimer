import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TournamentRunnerComponent } from './tournament-runner/tournament-runner.component';

const routes: Routes = [
  { path: 'runner', component: TournamentRunnerComponent},
  { path: '**', redirectTo:'/runner'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
