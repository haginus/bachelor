import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/services/admin.service';
import { Domain, SignUpRequest } from 'src/app/services/auth.service';
import { CNPValidator } from 'src/app/validators/CNP-validator';

@Component({
  selector: 'app-sign-up-request-dialog',
  templateUrl: './sign-up-request-dialog.component.html',
  styleUrls: ['./sign-up-request-dialog.component.scss']
})
export class SignUpRequestDialogComponent implements OnInit {

  domains: Domain[] = [];
  chosenDomain?: Domain;
  isLoading = false;

  constructor(private admin: AdminService, @Inject(MAT_DIALOG_DATA) public request: SignUpRequest, 
    private dialog: MatDialogRef<SignUpRequestDialogComponent>, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.signUpForm.get('domainId').valueChanges.subscribe(domainId => {
      this.chosenDomain = this.domains.find(domain => domain.id == domainId);
      this.signUpForm.get('specializationId').reset();
    });

    this.signUpForm.setValue({
      firstName: this.request.firstName,
      lastName: this.request.lastName,
      CNP: this.request.CNP,
      identificationCode: this.request.identificationCode,
      email: this.request.email,
      domainId: this.request.specialization.domainId,
      specializationId: this.request.specializationId,
      promotion: this.request.promotion,
      group: this.request.group,
      matriculationYear: this.request.matriculationYear,
      studyForm: this.request.studyForm,
      fundingForm: this.request.fundingForm,
    });

    this.admin.getDomains().subscribe((domains) => {
      this.domains = domains;
      this.chosenDomain = domains.find(domain => domain.id == this.request.specialization.domainId);
    });
    
  }

  signUpForm = new FormGroup({
    'firstName': new FormControl(null, [Validators.required]),
    'lastName': new FormControl(null, [Validators.required]),
    'CNP': new FormControl(null, [CNPValidator]),
    'identificationCode': new FormControl(null, [Validators.required]),
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'domainId': new FormControl(null, [Validators.required]),
    'specializationId': new FormControl(null, [Validators.required]),
    'promotion': new FormControl(null, [Validators.required]),
    'group': new FormControl(null, [Validators.required]),
    'matriculationYear': new FormControl(null, [Validators.required]),
    'studyForm': new FormControl(null, [Validators.required]),
    'fundingForm': new FormControl(null, [Validators.required])
  });

  declineRequest() {
    this.isLoading = true;
    this.admin.declineSignUpRequest(this.request.id).subscribe((r) => {
      if(r) {
        this.snackbar.open("Cererea a fost respinsă.");
        return this.dialog.close(true);
      }
      this.isLoading = false;
    });
  }

  acceptRequest() {
    this.isLoading = true;
    this.admin.acceptSignUpRequest(this.request.id, this.signUpForm.value).subscribe((r) => {
      if(r) {
        this.snackbar.open("Cererea a fost acceptată.");
        return this.dialog.close(true);
      }
      this.isLoading = false;
    });
  }
}
