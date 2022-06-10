import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-paper-validation-dialog',
  templateUrl: './paper-validation-dialog.component.html',
  styleUrls: ['./paper-validation-dialog.component.scss']
})
export class PaperValidationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<PaperValidationDialogComponent>) { }

  ngOnInit(): void {
  }

  validatePaperForm = new FormGroup({
    "generalAverage": new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10)]),
  });

  validate() {
    this.dialogRef.close(this.validatePaperForm.value["generalAverage"]);
  }

}
