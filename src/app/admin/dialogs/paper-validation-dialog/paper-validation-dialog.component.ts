import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-paper-validation-dialog',
  templateUrl: './paper-validation-dialog.component.html',
  styleUrls: ['./paper-validation-dialog.component.scss'],
  standalone: false
})
export class PaperValidationDialogComponent implements OnInit {

  validatePaperForm = new FormGroup({
    "generalAverage": new FormControl(null, [Validators.required, Validators.min(5), Validators.max(10), Validators.pattern(/^\d+(\.\d+)?$/)]),
    "warning": new FormControl(null)
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: PaperValidationDialogData, private dialogRef: MatDialogRef<PaperValidationDialogComponent>) {
    if(!this.data?.areDocumentsUploaded) {
      this.validatePaperForm.get("warning").setValidators([Validators.requiredTrue]);
      this.validatePaperForm.get("warning").updateValueAndValidity();
    }
    if(this.data?.generalAverage) {
      this.validatePaperForm.get("generalAverage").setValue('' + this.data?.generalAverage);
    }
  }

  ngOnInit(): void { }

  validate() {
    let generalAverage = Number(this.validatePaperForm.value["generalAverage"] as string);
    this.dialogRef.close(generalAverage);
  }
}

export interface PaperValidationDialogData {
  areDocumentsUploaded: boolean;
  generalAverage?: number;
}
