import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CNPValidator } from '../../../validators/CNP-validator';
import { CommonDialogComponent, CommonDialogData } from '../common-dialog/common-dialog.component';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../loading/loading.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomainsService } from '../../../services/domains.service';
import { Domain } from '../../../lib/types';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    RecaptchaModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    LoadingComponent,
    RouterLink,
  ]
})
export class SignUpComponent implements OnInit, OnDestroy {

  constructor(
    private readonly domainsService: DomainsService,
    private dialog: MatDialog,
    private auth: AuthService,
    private router: Router
  ) { }

  loading: boolean = false;

  @ViewChild('captcha') captchaComponent: RecaptchaComponent;

  captchaToken: string = null;

  DOMAIN_TYPES = DOMAIN_TYPES;

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
    'fundingForm': new FormControl(null, [Validators.required]),
    'termsCheck': new FormControl(null, [Validators.requiredTrue]),
    'segmentCheck': new FormControl(null, [Validators.requiredTrue])
  });

  domains: Domain[] = [];
  domainSubscription: Subscription;

  chosenDomain: Domain = null;

  ngOnInit(): void {
    this.domainSubscription = this.domainsService.findAll().subscribe(domains => {
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

}
