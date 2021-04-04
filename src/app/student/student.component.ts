import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, SessionSettings, UserData } from '../services/auth.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit, OnDestroy {

  constructor(private auth: AuthService) { }

  sessionSettings: SessionSettings;
  settingsSubscription: Subscription;
  user: UserData;
  userSubscription: Subscription;

  ngOnInit(): void {
    this.settingsSubscription = this.auth.sessionSettings.subscribe(settings => this.sessionSettings = settings);
    this.userSubscription = this.auth.userData.subscribe(user => this.user = user);
  }

  ngOnDestroy(): void {
    this.settingsSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

}
