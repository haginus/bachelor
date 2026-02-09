import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { UserProfileEditorComponent } from '../../../shared/components/user-profile-editor/user-profile-editor.component';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { Teacher } from '../../../lib/types';

@Component({
  selector: 'teacher-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatListModule,
    UserProfileEditorComponent,
  ]
})
export class TeacherSetupComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) { }

  userObservable: any;
  loadingUser: boolean = true;
  loadingValidation: boolean = true;

  user!: Teacher;

  async ngOnInit() {
    this.user = await firstValueFrom(this.auth.getUserData()) as Teacher;
    if(!this.user.validated) {
      this.loadingUser = false;
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  validationForm = new FormGroup({
    'isValid': new FormControl(null, [Validators.requiredTrue])
  });

  selectionChange(ev:StepperSelectionEvent) {
    if(ev.selectedIndex == 2) {
      this.validateTeacher();
    }
  }

  async validateTeacher() {
    this.loadingValidation = true;
    try {
      await firstValueFrom(this.auth.validateUser());
      this.router.navigate(['dashboard']);
    } finally {
      this.loadingValidation = false;
    }
  }

}
