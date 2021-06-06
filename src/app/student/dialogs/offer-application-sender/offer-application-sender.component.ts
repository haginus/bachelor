import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OfferApplication, StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-offer-application-sender',
  templateUrl: './offer-application-sender.component.html',
  styleUrls: ['./offer-application-sender.component.scss']
})
export class OfferApplicationSenderComponent implements OnInit {

  constructor(private dialog: MatDialogRef<OfferApplicationSenderComponent>, @Inject(MAT_DIALOG_DATA) private offerId: number,
    private student: StudentService, private snackbar: MatSnackBar) { }

  applicationForm = new FormGroup({
    "title": new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(256)]),
    "description": new FormControl(null, [Validators.required, Validators.minLength(64), Validators.maxLength(1024)]),
    "usedTechnologies": new FormControl(null, [Validators.maxLength(256)])
  })

  isLoadingQuery = false;

  ngOnInit(): void {
  }

  private _getFormAplication() {
    const title = this.applicationForm.get("title").value;
    const description = this.applicationForm.get("description").value;
    const usedTechnologies = this.applicationForm.get("usedTechnologies").value;
    
    let application: OfferApplication = { title, description, usedTechnologies };
    return application;
  }

  applyOffer() {
    let application: OfferApplication = this._getFormAplication();
    this.isLoadingQuery = true;
    this.student.applyToOffer(this.offerId, application).subscribe(result => {
      if(result.success) {
        this.snackbar.open("Cerere trimisă.");
        this.closeSuccess();
      }
      this.isLoadingQuery = false;
    });
  }

  closeSuccess() {
    this.dialog.close(true);
  }

  closeFailure() {
    this.dialog.close(false);
  }

}
