import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserSnippetComponent } from '../user-snippet/user-snippet.component';
import { Application } from '../../../lib/types';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    UserSnippetComponent,
  ],
})
export class ApplicationListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  DOMAIN_TYPES = DOMAIN_TYPES;

  @Input('mode') mode: 'student' | 'teacher';
  @Input('items') applications: Application[];
  @Output('actions') actions = new EventEmitter<ApplicationListActions>();

  sendEvent(action: 'accept' | 'decline' | 'cancel', application: Application) {
    this.actions.emit({ action, application })
  }
}

export interface ApplicationListActions {
  action: 'accept' | 'decline' | 'cancel';
  application: Application;
}
