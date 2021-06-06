import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void { }

  loading: boolean = false;

  loginForm = new FormGroup({
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'password': new FormControl(null, [Validators.minLength(6), Validators.required]),
  });

  forgotPasswordForm = new FormGroup({
    'email': new FormControl(null, [Validators.email, Validators.required]),
  });

  view: 'login' | 'forgotPassword' = 'login';

  signIn() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this.loading = true;
    this.auth.signInWithEmailAndPassword(email, password).subscribe(res => {
      if(res.error) {
        this.handleError(res.error);
        this.loading = false;
      } else {
        this.router.navigate([res.user.type]);
      }
    })
  }

  sendForgotPasswordEmail() {
    const email = this.forgotPasswordForm.get('email')?.value;
    this.loading = true;
    this.auth.sendResetPasswordEmail(email).subscribe(result => {
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
  }

}
