import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserData } from '../../../services/auth.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { UserProfileEditorComponent } from '../../../shared/components/user-profile-editor/user-profile-editor.component';

@Component({
  selector: 'teacher-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatListModule,
    UserProfileEditorComponent,
  ],
})
export class TeacherSetupComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) { }

  userObservable: any;
  loadingUser: boolean = true;
  loadingValidation: boolean = true;


  user!: UserData;

  ngOnInit(): void {
    this.userObservable = this.auth.getUserData().subscribe(user => {
      this.user = (user as UserData);
      if(!this.user.validated) {
        this.loadingUser = false;
      } else {
        this.router.navigate(['dashboard']);
      }
    });
  }

  validationForm = new FormGroup({
    'isValid': new FormControl(null, [Validators.requiredTrue])
  });

  selectionChange(ev:StepperSelectionEvent) {
    if(ev.selectedIndex == 2) {
      this.validateTeacher();
    }
  }

  validateTeacher() {
    this.loadingValidation = true;
    this.auth.validateTeacher().subscribe(res => {
      if(!res) {
        this.loadingValidation = false;
      } else {
        this.router.navigate(['dashboard']);
      }
    })
  }

}
