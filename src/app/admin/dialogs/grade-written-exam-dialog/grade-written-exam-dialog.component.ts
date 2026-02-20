import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Submission, WrittenExamGrade } from '../../../lib/types';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { WrittenExamService } from '../../../services/written-exam.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-grade-written-exam-dialog',
  templateUrl: './grade-written-exam-dialog.component.html',
  styleUrls: ['./grade-written-exam-dialog.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
  ]
})
export class GradeWrittenExamDialogComponent {

  protected readonly data: GradeWrittenExamDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<GradeWrittenExamDialogComponent>);
  private readonly writtenExamService = inject(WrittenExamService);

  writtenExamGradeForm = new FormGroup({
    initialGrade: new FormControl(this.data.existingGrade?.initialGrade, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern(/^\d{1,2}$/)]),
    disputeGrade: new FormControl(this.data.existingGrade?.disputeGrade, [Validators.min(1), Validators.max(10), Validators.pattern(/^\d{1,2}$/)]),
  });
  isAbsent = this.data.existingGrade?.initialGrade === 0;
  isSubmitting = false;

  get initialGradeControl() {
    return this.writtenExamGradeForm.get('initialGrade')!;
  }

  get disputeGradeControl() {
    return this.writtenExamGradeForm.get('disputeGrade')!;
  }

  constructor() {
    if(!this.data.existingGrade?.isDisputed) {
      this.disputeGradeControl.disable();
    }
    this.onAbsentChange(this.isAbsent);
  }

  onAbsentChange(isAbsent: boolean) {
    this.isAbsent = isAbsent;
    if(isAbsent) {
      this.writtenExamGradeForm.reset();
      this.writtenExamGradeForm.disable();
    } else {
      this.writtenExamGradeForm.reset(this.data.existingGrade);
      this.initialGradeControl.enable();
      if(this.data.existingGrade?.isDisputed) {
        this.disputeGradeControl.enable();
      }
    }
  }

  async grade() {
    const payload = this.isAbsent ? { initialGrade: 0, disputeGrade: null } : this.writtenExamGradeForm.getRawValue();
    this.isSubmitting = true;
    try {
      const grade = await firstValueFrom(this.writtenExamService.gradeSubmission(this.data.submission.id, payload));
      this.dialogRef.close(grade);
    } finally {
      this.isSubmitting = false;
    }
  }
}

export interface GradeWrittenExamDialogData {
  submission: Submission;
  existingGrade?: WrittenExamGrade;
}
