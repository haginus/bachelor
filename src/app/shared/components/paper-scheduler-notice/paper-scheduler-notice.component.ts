import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Committee } from '../../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaperSchedulerComponent } from '../paper-scheduler/paper-scheduler.component';

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

  constructor(
    private readonly dialog: MatDialog,
  ) {
  }

  showNotice = true;
  @Input({ required: true }) committee: Committee;

  openScheduler() {
    this.dialog.open(PaperSchedulerComponent, {
      data: this.committee,
      width: '95vw',
      maxWidth: '95vw'
    });
  }
}
