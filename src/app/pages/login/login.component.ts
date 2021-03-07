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

  signIn() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this.loading = true;
    this.auth.signInWithEmailAndPassword(email, password).subscribe(res => {
      this.loading = false;
      if(res.error) {
        this.handleError(res.error);
      } else {
        this.router.navigate([res.user.type]);
      }
    })
  }

  private handleError(err: string) {
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');;
    let msg;
    switch(err) {
      case 'EMAIL_NOT_FOUND':
        msg = 'E-mailul nu există.';
        emailControl?.setErrors({"notExists": true});
        break;
      case 'WRONG_PASSWORD':
        msg = 'Parolă incorectă.';
        passwordControl?.setErrors({"wrong": true});
        break;
      case 'NOT_ACTIVATED':
        msg = 'Contul nu este activat. Verificați-vă e-mailul.';
        break;
      default:
        msg = 'A apărut o eroare. Reîncercați.';
    }
    this.snackBar.open(msg);
  }



}
