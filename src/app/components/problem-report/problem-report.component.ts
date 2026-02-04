import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DialogModule } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../lib/types';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-problem-report',
  templateUrl: './problem-report.component.html',
  styleUrls: ['./problem-report.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    LoadingComponent,
  ],
})
export class ProblemReportComponent implements OnInit, OnDestroy {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ProblemReportDialogData,
    private readonly feedbackService: FeedbackService,
    private dialog: MatDialogRef<ProblemReportComponent>,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) {}

  problemReportForm = new FormGroup({
    type: new FormControl(this.data?.type, [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.minLength(16), Validators.maxLength(1024)]),
    replyToEmail: new FormControl(this.data?.email, [Validators.required, Validators.email]),
    fullName: new FormControl('', []),
  });

  get problemType() {
    return this.problemReportForm.get("type");
  }

  userDataSubscription: Subscription;
  user: User;
  isSendingMessage: boolean = false;

  async ngOnInit() {
    if(this.data?.type) {
      this.problemType.disable();
    }
    this.user = await firstValueFrom(this.auth.userData);
    if(!this.user) {
      const fullNameControl = this.problemReportForm.get("fullName");
      fullNameControl.setValidators([Validators.required, Validators.minLength(4), fullNameValidator]);
      fullNameControl.updateValueAndValidity();
    } else {
      this.problemReportForm.get("replyToEmail").setValue(this.user.email);
    }
  }

  ngOnDestroy(): void {
    this.userDataSubscription?.unsubscribe();
  }

  async sendForm() {
    const formValue = this.problemReportForm.getRawValue();
    const [lastName, firstName] = formValue.fullName?.trim().split(' ');
    const dto = {
      ...formValue,
      user: this.user ? undefined : { firstName, lastName },
    }
    this.isSendingMessage = true;
    try {
      await firstValueFrom(this.feedbackService.sendFeedback(dto));
      this.dialog.close();
      this.snackbar.open("Mesajul a fost trimis. Ați primit o copie pe e-mail.");
    } finally {
      this.isSendingMessage = false;
    }
  }

}

const fullNameValidator = (control: FormControl) => {
  const value: string = control.value;
  const [lastName, firstName] = value.trim().split(' ').map(s => s.trim());
  if(!firstName || !lastName) {
    return { fullName: true };
  }
  return null;
};

export interface ProblemReportDialogData {
  type?: string;
  email?: string;
}

@Component({
  selector: 'app-problem-report-button',
  template: `
    @if(showText) {
      <button mat-button (click)="openDialog()">
        <mat-icon>feedback</mat-icon>
        <span>Raportați o problemă</span>
      </button>
    } @else {
      <button mat-icon-button (click)="openDialog()" matTooltip="Raportați o problemă">
        <mat-icon>feedback</mat-icon>
      </button>
    }
  `,
  standalone: true,
  imports: [
    DialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class ProblemReportButtonComponent {
  @Input() data?: ProblemReportDialogData;
  @Input() showText: boolean = false;

  constructor(
    private dialog: MatDialog,
  ) {}

  openDialog() {
    this.dialog.open<ProblemReportComponent, ProblemReportDialogData>(ProblemReportComponent, {
      data: this.data,
    });
  }
}
