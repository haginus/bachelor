import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { AuthService, Domain } from '../../services/auth.service';
import { MiscService } from '../../services/misc.service';
import { CNPValidator } from '../../validators/CNP-validator';
import { CommonDialogComponent, CommonDialogData } from '../../shared/common-dialog/common-dialog.component';
import { ProblemReportComponent, ProblemReportDialogData } from '../../components/problem-report/problem-report.component';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {

  constructor(private dialog: MatDialog, private auth: AuthService, private misc: MiscService, private router: Router) { }

  loading: boolean = false;

  @ViewChild('captcha') captchaComponent: RecaptchaComponent;

  captchaToken: string = null;

  solvedCaptcha(captchaToken: string) {
    this.captchaToken = captchaToken;
  }

  signUpForm = new FormGroup({
    'firstName': new FormControl(null, [Validators.required]),
    'lastName': new FormControl(null, [Validators.required]),
    'CNP': new FormControl(null, [CNPValidator]),
    'identificationCode': new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]*\/[1-2][0-9]{3}$/)]),
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'domainId': new FormControl(null, [Validators.required]),
    'specializationId': new FormControl(null, [Validators.required]),
    'promotion': new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
    'group': new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]),
    'matriculationYear': new FormControl(null, [Validators.required, Validators.minLength(4), Validators.maxLength(4)]),
    'studyForm': new FormControl(null, [Validators.required]),
    'fundingForm': new FormControl(null, [Validators.required]),
    'termsCheck': new FormControl(null, [Validators.requiredTrue]),
    'segmentCheck': new FormControl(null, [Validators.requiredTrue])
  });

  domains: Domain[] = [];
  domainSubscription: Subscription;

  chosenDomain: Domain = null;

  ngOnInit(): void {
    this.domainSubscription = this.misc.getDomains().subscribe(domains => {
      this.domains = domains;
    });

    const specializationIdControl = this.signUpForm.get('specializationId');
    specializationIdControl.disable();

    this.signUpForm.get('domainId').valueChanges.subscribe(domainId => {
      this.chosenDomain = this.domains.find(domain => domain.id == domainId);
      specializationIdControl.reset();
      if(this.chosenDomain) {
        specializationIdControl.enable();
      } else {
        specializationIdControl.disable();
      }
    });
  }

  ngOnDestroy(): void {
    this.domainSubscription?.unsubscribe();
  }

  signUp() {
    this.auth.signUp(this.signUpForm.value as any, this.captchaToken).subscribe((result) => {
      if(!result) return;

      this.dialog.open<CommonDialogComponent, CommonDialogData>(CommonDialogComponent, {
        data: {
          title: "Cerere înregistrată",
          content: "Vom verifica datele pe care le-ați introdus. Veți primi un e-mail în momentul în care contul dvs. este creat.",
          actions: [
            { name: "OK", value: true }
          ]
        }
      }).afterClosed().subscribe(() => {
        this.router.navigate(['/']);
      });
    });
  }

  sendProblem() {
    this.dialog.open<ProblemReportComponent, ProblemReportDialogData>(ProblemReportComponent, {
      data: {
        type: "data"
      }
    });
  }

}
