import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../loading/loading.component';
import { ProblemReportButtonComponent } from '../../../components/problem-report/problem-report.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RecaptchaModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ProblemReportButtonComponent,
    LoadingComponent,
    RouterLink,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe(params => {
      this.nextRoute = params['next'];
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  routeSub: Subscription;

  loading: boolean = false;

  loginForm = new FormGroup({
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'password': new FormControl(null, [Validators.minLength(6), Validators.required]),
  });

  forgotPasswordForm = new FormGroup({
    'email': new FormControl(null, [Validators.email, Validators.required]),
  });

  view: 'login' | 'forgotPassword' = 'login';

  nextRoute: string = null;

  captchaToken: string = null;

  @ViewChild('captcha') captchaComponent: RecaptchaComponent;

  solvedCaptcha(captchaToken: string) {
    this.captchaToken = captchaToken;
  }

  changeView(view: 'login' | 'forgotPassword') {
    this.view = view;
    this.captchaToken = null;
  }

  signIn() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this.loading = true;
    this.auth.signInWithEmailAndPassword(email, password, this.captchaToken).subscribe(res => {
      if(res.error) {
        this.handleError(res.error);
        this.loading = false;
      } else {
        if(this.nextRoute) {
          this.router.navigateByUrl(this.nextRoute);
        } else {
          this.router.navigate([res.user.type]);
        }
      }
    })
  }

  sendForgotPasswordEmail() {
    const email = this.forgotPasswordForm.get('email')?.value;
    this.loading = true;
    this.auth.sendResetPasswordEmail(email, this.captchaToken).subscribe(result => {
      this.loading = false;
      if(result) {
        this.snackBar.open("E-mail de resetare a parolei a fost trimis.");
      }
    });
  }

  private handleError(err: string) {
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');;
    switch(err) {
      case 'EMAIL_NOT_FOUND':
        emailControl?.setErrors({"notExists": true});
        break;
      case 'WRONG_PASSWORD':
        passwordControl?.setErrors({"wrong": true});
        break;
    }
    this.captchaComponent.reset();
  }

}
