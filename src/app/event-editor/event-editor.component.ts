import { Component, Input, OnInit } from '@angular/core';
import { Event } from '../tournament-model';

@Component({
  selector: 'app-event-editor',
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.css']
})
export class EventEditorComponent implements OnInit {

  @Input() event: Event|undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
