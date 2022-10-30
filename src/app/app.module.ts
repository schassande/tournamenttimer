import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TournamentService } from './tournament-service';
import { TournamentRunnerComponent } from './tournament-runner/tournament-runner.component';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TournamentEditorComponent } from './tournament-editor/tournament-editor.component';
import { HomeComponent } from './home/home.component';
import { EventsEditorComponent } from './events-editor/events-editor.component';
import { PatternsEditorComponent } from './patterns-editor/patterns-editor.component';
import { EventEditorComponent } from './event-editor/event-editor.component';
import { DayEditorComponent } from './day-editor/day-editor.component';
import { PatternEditorComponent } from './pattern-editor/pattern-editor.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

@NgModule({
  declarations: [
    AppComponent,
    TournamentRunnerComponent,
    TournamentEditorComponent,
    HomeComponent,
    EventsEditorComponent,
    PatternsEditorComponent,
    EventEditorComponent,
    DayEditorComponent,
    PatternEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    NgxMaterialTimepickerModule,
    ScrollingModule
  ],
  providers: [TournamentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
