import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AuthService, UserData } from 'src/app/services/auth.service';
import { MiscService } from 'src/app/services/misc.service';

@Component({
  selector: 'app-problem-report',
  templateUrl: './problem-report.component.html',
  styleUrls: ['./problem-report.component.scss']
})
export class ProblemReportComponent implements OnInit, OnDestroy {

  constructor(@Inject(MAT_DIALOG_DATA) private data: ProblemReportDialogData, private dialog: MatDialogRef<ProblemReportComponent>,
    private auth: AuthService, private misc: MiscService, private snackbar: MatSnackBar) { }

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
  user: UserData;
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
    this.misc.sendProblemReport(formValue).subscribe(result => {
      if(result) {
        this.dialog.close();
        this.snackbar.open("Mesajul a fost trimis. Ați primit o copie pe e-mail.");
      } else {
        this.isSendingMessage = false;
      }
    });
  }

}

export interface ProblemReportDialogData {
  type?: string;
  email?: string;
}
