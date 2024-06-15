import { Component } from '@angular/core';
import { SessionInfoComponent } from '../../../shared/components/session-info/session-info.component';
import { FaqComponent } from '../../../shared/components/faq/faq.component';

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

}
