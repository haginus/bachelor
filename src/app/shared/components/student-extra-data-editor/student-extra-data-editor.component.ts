import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserData } from '../../../services/auth.service';
import { StudentExtraData } from '../../../services/student.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-student-extra-data-editor',
  templateUrl: './student-extra-data-editor.component.html',
  styleUrls: ['./student-extra-data-editor.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
})
export class StudentExtraDataEditorComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) dialogData: StudentExtraDataEditorData,
    private dialog: MatDialogRef<StudentExtraDataEditorComponent>
  ) {
    this.studentExtraData = dialogData.studentExtraData;
    this.userData = dialogData.student;
  }

  studentExtraData: StudentExtraData;
  userData: UserData;
  isSavingData: boolean = false;

  studentDataForm = new FormGroup({
    "birthLastName": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "parentInitial": new FormControl(null, [Validators.required, Validators.pattern(/^[A-Z][a-z]?\.( [A-Z][a-z]?\.){0,2}$/)]),
    "fatherName": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "motherName": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "civilState": new FormControl(null, [Validators.required]),
    "dateOfBirth": new FormControl(null, [Validators.required]),
    "citizenship": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "ethnicity": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "placeOfBirthCountry": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "placeOfBirthCounty": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "placeOfBirthLocality": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "landline": new FormControl(null, [Validators.required, Validators.pattern(/^((\+[0-9]{11})|([0-9]{10}))$/)]),
    "mobilePhone": new FormControl(null, [Validators.required, Validators.pattern(/^((\+[0-9]{11})|([0-9]{10}))$/)]),
    "personalEmail": new FormControl(null, [Validators.required, Validators.email]),
    "address": new FormGroup({
      "county": new FormControl(null, [Validators.required]),
      "locality": new FormControl(null, [Validators.required]),
      "street": new FormControl(null, [Validators.required]),
      "streetNumber": new FormControl(null, [Validators.required]),
      "building": new FormControl(null),
      "stair": new FormControl(null),
      "floor": new FormControl(null),
      "apartment": new FormControl(null),
    })
  });

  ngOnInit(): void {
    if(this.studentExtraData) {
      try {
        this.studentDataForm.patchValue(this.studentExtraData as any);
        this.studentDataForm.markAllAsTouched();
      } catch(err) {
        console.error(err);
      }
    }
  }

  saveData() {
    this.isSavingData = true;
    const formValue = this.studentDataForm.value as StudentExtraData;
    this.studentExtraData = formValue;
    this.dialog.close(this.studentExtraData);
  }

}

export interface StudentExtraDataEditorData {
  studentExtraData: StudentExtraData | null;
  student: UserData;
}
