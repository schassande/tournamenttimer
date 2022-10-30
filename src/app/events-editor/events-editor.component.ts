import { Component, Input, OnInit } from '@angular/core';
import { Event } from '../tournament-model';

@Component({
  selector: 'app-events-editor',
  templateUrl: './events-editor.component.html',
  styleUrls: ['./events-editor.component.css']
})
export class EventsEditorComponent implements OnInit {
  @Input() events: Event[] = []
  currentEvent: Event|undefined;

  constructor() { }

  ngOnInit(): void {
  }
  deleteEvent(idx: number) {
    this.events.splice(idx, 1);
  }
  newEvent() {
    this.currentEvent = { name: '', soundFile: '', text:''};
    this.events.push(this.currentEvent);
  }
  eventSelected(ev: Event) {
    this.currentEvent = ev;
  }
}
