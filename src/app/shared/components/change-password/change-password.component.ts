import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../loading/loading.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingComponent,
  ]
})
export class ChangePasswordComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  mode = "token";
  userEmail: string = null;
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
    if(this.token) {
      this.auth.checkPasswordResetToken(this.token).subscribe(res => {
        if(res.email == null) {
          this.router.navigate(['login']);
        } else {
          this.userEmail = res.email;
        }
      });
    }
  }

  changePassword() {
    const password = this.changePasswordForm.get('password')?.value;
    this.loading = true;
    this.auth.signInWithTokenAndChangePassword(this.token, password).subscribe(res => {
      this.loading = false;
      if(!res.error) {
        this.router.navigate(["dashboard"]);
      }
    });
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
    const foreignInvalidity = form.form.errors?.['passwordsNotMatched'];
    return (control.invalid || foreignInvalidity) && (control.dirty || control.touched);
  }
}


