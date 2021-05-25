import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, SessionSettings } from 'src/app/services/auth.service';

@Component({
  selector: 'app-session-info',
  templateUrl: './session-info.component.html',
  styleUrls: ['./session-info.component.scss']
})
export class SessionInfoComponent implements OnInit, OnDestroy {

  constructor(private auth: AuthService) { }

  sessionSettings: SessionSettings;
  subscription: Subscription;
  ngOnInit(): void {
    this.subscription = this.auth.sessionSettings.subscribe(settings => {
      this.sessionSettings = settings;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
