import { Component } from '@angular/core';
import { SessionInfoComponent } from '../../../shared/components/session-info/session-info.component';
import { FaqComponent } from '../../../shared/components/faq/faq.component';
import { AuthService } from '../../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SessionSettings, User } from '../../../lib/types';

@Component({
  selector: 'app-dashboard',
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
  user: User;

}
