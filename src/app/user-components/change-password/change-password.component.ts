import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router,
    private auth: AuthService, private snackBar: MatSnackBar) { }

  mode = "token";
  loading: boolean = false;
  token: string;

  changePasswordForm = new FormGroup({
    "currentPassword": new FormControl(null, [Validators.minLength(6)]),
    "password": new FormControl(null, [Validators.required, Validators.minLength(6)]),
    "confirmPassword": new FormControl(null, [Validators.required, Validators.minLength(6)]),
  }, { validators: ChangePasswordComponent.foreignKeyValidator })

  matcher = new MyErrorStateMatcher();

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
  }

  changePassword() {
    const password = this.changePasswordForm.get('password')?.value;
    const confirmPassword = this.changePasswordForm.get('confirmPassword')?.value;
    this.loading = true;
    this.auth.signInWithTokenAndChangePassword(this.token, password, confirmPassword).subscribe(res => {
      this.loading = false;
      if(res.error) {
        this.handleError(res.error);
      } else {
        this.router.navigate(["dashboard"]);
      }
    })
  }

  private handleError(err: string) {
    let msg;
    switch(err) {
      case 'INVALID_CODE':
        msg = 'Cod de activare greșit.';
        break;
      default:
        msg = 'A apărut o eroare. Reîncercați.';
    }
    this.snackBar.open(msg);
  }

  static foreignKeyValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    let errors = {}
    if(password.value !== confirmPassword.value && password.dirty && confirmPassword.dirty) {
      errors["passwordsNotMatched"] = true;
    }
    return Object.keys(errors).length ? errors : null;
  };

}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    const foreignInvalidity = form.form.errors?.passwordsNotMatched;
    return (control.invalid || foreignInvalidity) && (control.dirty || control.touched);
  }
}


