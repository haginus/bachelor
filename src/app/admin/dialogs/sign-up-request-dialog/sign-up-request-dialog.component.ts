import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CNPValidator } from '../../../validators/CNP-validator';
import { Domain, SignUpRequest } from '../../../lib/types';
import { DomainsService } from '../../../services/domains.service';
import { SignUpRequestsService } from '../../../services/sign-up-requests.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sign-up-request-dialog',
  templateUrl: './sign-up-request-dialog.component.html',
  styleUrls: ['./sign-up-request-dialog.component.scss'],
  standalone: false
})
export class SignUpRequestDialogComponent implements OnInit {

  domains: Domain[] = [];
  chosenDomain?: Domain;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public request: SignUpRequest,
    private readonly domainsService: DomainsService,
    private readonly signUpRequestsService: SignUpRequestsService,
    private dialog: MatDialogRef<SignUpRequestDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

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
      domainId: this.request.specialization.domain.id,
      specializationId: this.request.specialization?.id || null,
      promotion: this.request.promotion,
      group: this.request.group,
      matriculationYear: this.request.matriculationYear,
      fundingForm: this.request.fundingForm,
      generalAverage: '',
    });

    this.domainsService.findAll().subscribe((domains) => {
      this.domains = domains;
      this.chosenDomain = domains.find(domain => domain.id == this.request.specialization.domain.id);
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
    'fundingForm': new FormControl(null, [Validators.required]),
    'generalAverage': new FormControl(null, [Validators.min(5), Validators.max(10)]),
  });

  async declineRequest() {
    this.isLoading = true;
    try {
      await firstValueFrom(this.signUpRequestsService.decline(this.request.id));
      this.snackbar.open("Cererea a fost respinsă.");
      this.dialog.close(true);
    } finally {
      this.isLoading = false;
    }
  }

  async acceptRequest() {
    this.isLoading = true;
    try {
      await firstValueFrom(this.signUpRequestsService.accept(this.request.id, this.signUpForm.value as any));
      this.snackbar.open("Cererea a fost acceptată.");
      this.dialog.close(true);
    } finally {
      this.isLoading = false;
    }
  }

}
