import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProblemReportComponent, ProblemReportDialogData } from '../../../components/problem-report/problem-report.component';
import { MatIconModule } from '@angular/material/icon';
import { Paper } from '../../../lib/types';

@Component({
  selector: 'app-submit-paper-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './submit-paper-dialog.component.html',
  styleUrl: './submit-paper-dialog.component.scss'
})
export class SubmitPaperDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) protected readonly paper: Paper,
    private readonly dialog: MatDialog,
  ) {}

  cooldownSeconds = 30;
  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.cooldownSeconds -= 1;
      if(this.cooldownSeconds === 0) {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  reportInvalidData() {
    this.dialog.open<ProblemReportComponent, ProblemReportDialogData>(ProblemReportComponent, {
      data: {
        type: "data"
      }
    });
  }

}
