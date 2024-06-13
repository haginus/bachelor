import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DOMAIN_TYPES } from '../../lib/constants';
import { OfferApplication } from '../../services/student.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.scss']
})
export class ApplicationListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  DOMAIN_TYPES = DOMAIN_TYPES;

  @Input('mode') mode: 'student' | 'teacher';
  @Input('items') applications: OfferApplication[];
  @Output('actions') actions = new EventEmitter<ApplicationListActions>();

  sendEvent(action: 'accept' | 'decline' | 'cancel', applicationId: number) {
    this.actions.emit({ action, applicationId })
  }
}

export interface ApplicationListActions {
  action: 'accept' | 'decline' | 'cancel',
  applicationId: number
}
