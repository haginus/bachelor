import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-paper-scheduler-notice',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './paper-scheduler-notice.component.html',
  styleUrl: './paper-scheduler-notice.component.scss'
})
export class PaperSchedulerNoticeComponent {

  @Output() schedulePress = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
