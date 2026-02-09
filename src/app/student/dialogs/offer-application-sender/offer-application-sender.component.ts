import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApplicationsService } from '../../../services/applications.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-offer-application-sender',
  templateUrl: './offer-application-sender.component.html',
  styleUrls: ['./offer-application-sender.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ]
})
export class OfferApplicationSenderComponent{

  constructor(
    @Inject(MAT_DIALOG_DATA) private offerId: number,
    private dialogRef: MatDialogRef<OfferApplicationSenderComponent>,
    private readonly applicationsService: ApplicationsService,
    private snackbar: MatSnackBar
  ) {}

  applicationForm = new FormGroup({
    "title": new FormControl<string>(null, [Validators.required, Validators.minLength(3), Validators.maxLength(256)]),
    "description": new FormControl<string>(null, [Validators.required, Validators.minLength(64), Validators.maxLength(1024)]),
    "usedTechnologies": new FormControl<string>(null, [Validators.maxLength(256)])
  });

  isLoadingQuery = false;

  async applyToOffer() {
    const dto = { ...this.applicationForm.getRawValue(), offerId: this.offerId };
    this.isLoadingQuery = true;
    try {
      const application = await firstValueFrom(this.applicationsService.create(dto));
      this.snackbar.open("Cererea a fost trimisă.");
      this.dialogRef.close(application);
    } finally {
      this.isLoadingQuery = false;
    }
  }

}
