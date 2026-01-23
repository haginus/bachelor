import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserData } from '../../../services/auth.service';
import { CNPValidator } from '../../../validators/CNP-validator';
import { TeachersService } from '../../../services/teachers.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-teacher-dialog',
  templateUrl: './teacher-dialog.component.html',
  styleUrls: ['./teacher-dialog.component.scss']
})
export class AdminTeacherDialogComponent {

  constructor(
    private readonly teachersService: TeachersService,
    @Inject(MAT_DIALOG_DATA) public readonly data: AdminTeacherDialogData,
    private readonly dialogRef: MatDialogRef<AdminTeacherDialogComponent>,
    private readonly sb: MatSnackBar,
  ) {}

  isSubmitting = false;

  teacherForm = new FormGroup({
    'firstName': new FormControl(this.data.data?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.data?.lastName, [Validators.required]),
    'title': new FormControl(this.data.data?.title),
    'CNP': new FormControl(this.data.data?.CNP, [CNPValidator]),
    'email': new FormControl(this.data.data?.email, [Validators.email, Validators.required]),
  });

  get emailChanged() {
    return this.data.mode == 'edit' && this.teacherForm.get("email").value != this.data.data?.email;
  }

  async saveTeacher() {
    const dto = this.teacherForm.getRawValue();
    this.isSubmitting = true;
    try {
      const result = this.data.mode == 'create'
        ? await firstValueFrom(this.teachersService.create(dto))
        : await firstValueFrom(this.teachersService.update(this.data.data!.id, dto));
      this.dialogRef.close(result);
      this.sb.open("Profesor salvat.");
    } finally {
      this.isSubmitting = false;
    }
  }

}

export interface AdminTeacherDialogData {
  mode: "view" | "create" | "edit";
  data?: UserData;
}
