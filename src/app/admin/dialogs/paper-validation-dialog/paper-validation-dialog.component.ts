import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-paper-validation-dialog',
  templateUrl: './paper-validation-dialog.component.html',
  styleUrls: ['./paper-validation-dialog.component.scss']
})
export class PaperValidationDialogComponent implements OnInit {

  validatePaperForm = new FormGroup({
    "generalAverage": new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10)]),
    "warning": new FormControl(null)
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: PaperValidationDialogData, private dialogRef: MatDialogRef<PaperValidationDialogComponent>) {
    if(!this.data?.areDocumentsUploaded) {
      this.validatePaperForm = new FormGroup({
        "generalAverage": new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10)]),
        "warning": new FormControl(null, [Validators.requiredTrue])
      });
    }
    if(this.data?.generalAverage) {
      this.validatePaperForm.get("generalAverage").setValue(this.data?.generalAverage);
    }
  }

  ngOnInit(): void { }

  validate() {
    let generalAverage = (this.validatePaperForm.value["generalAverage"] as string).replace(",", ".");
    this.dialogRef.close(generalAverage);
  }

}

export interface PaperValidationDialogData {
  areDocumentsUploaded: boolean;
  generalAverage?: number;
}
