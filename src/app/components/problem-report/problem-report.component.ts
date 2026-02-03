import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
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
    private dialog: MatDialogRef<ProblemReportComponent>,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) {}

  problemReportForm = new FormGroup({
    type: new FormControl(this.data?.type, [Validators.required]),
    description: new FormControl(null, [Validators.required, Validators.minLength(16), Validators.maxLength(1024)]),
    email: new FormControl(this.data?.email, [Validators.required, Validators.email]),
    fullName: new FormControl('', []),
  });

  get problemType() {
    return this.problemReportForm.get("type");
  }

  userDataSubscription: Subscription;
  user: User;
  isSendingMessage: boolean = false;

  ngOnInit(): void {
    if(this.data?.type) {
      this.problemType.disable();
    }
    if(!this.data?.email) {
      this.userDataSubscription = this.auth.userData.subscribe(user => {
        this.user = user;
        if(!user) {
          this.problemReportForm.get("fullName").setValidators([Validators.required]);
        } else {
          this.problemReportForm.get("email").setValue(user.email);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.userDataSubscription?.unsubscribe();
  }

  sendForm() {
    this.isSendingMessage = true;
    this.problemType.enable();
    const formValue = this.problemReportForm.value;
    if(this.data?.type) {
      this.problemType.disable();
    }
    // TODO: Implement sending problem report
    // this.misc.sendProblemReport(formValue as any).subscribe(result => {
    //   if(result) {
    //     this.dialog.close();
    //     this.snackbar.open("Mesajul a fost trimis. Ați primit o copie pe e-mail.");
    //   } else {
    //     this.isSendingMessage = false;
    //   }
    // });
  }

}

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
