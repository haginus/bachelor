import { Component, Inject, OnInit } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Paper } from '../../../lib/types';

@Component({
  selector: 'app-grade-paper',
  templateUrl: './grade-paper.component.html',
  styleUrls: ['./grade-paper.component.scss'],
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ]
})
export class GradePaperComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) protected readonly paper: Paper,
  ) {}

  gradeForm = new FormGroup({
    // only integer numbers ranged from 1 to 10
    "forPaper": new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern("^[0-9]*$")]),
    "forPresentation": new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern("^[0-9]*$")])
  });

  get forPaper() { return this.gradeForm.get('forPaper'); }
  get forPresentation() { return this.gradeForm.get('forPresentation'); }

  ngOnInit(): void {
  }

}
