import { Component } from '@angular/core';
import { SessionInfoComponent } from '../../../shared/components/session-info/session-info.component';
import { FaqComponent } from '../../../shared/components/faq/faq.component';
import { AuthService, SessionSettings, UserData } from '../../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SessionInfoComponent,
    FaqComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(private auth: AuthService) {
    this.auth.sessionSettings.pipe(
      takeUntilDestroyed()
    ).subscribe(settings => {
      this.sessionSettings = settings
    });
    this.auth.userData.pipe(
      takeUntilDestroyed()
    ).subscribe(user => {
      this.user = user
    });
  }

  sessionSettings: SessionSettings;
  user: UserData;

}
