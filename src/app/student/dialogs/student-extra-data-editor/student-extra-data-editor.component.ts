import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService, UserData } from 'src/app/services/auth.service';
import { StudentExtraData } from 'src/app/services/student.service';

@Component({
  selector: 'app-student-extra-data-editor',
  templateUrl: './student-extra-data-editor.component.html',
  styleUrls: ['./student-extra-data-editor.component.scss']
})
export class StudentExtraDataEditorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: StudentExtraData, private auth: AuthService,
    private dialog: MatDialogRef<StudentExtraDataEditorComponent> ) {
    this.studentExtraData = this.dialogData;
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
  })

  ngOnInit(): void {
    this.auth.userData.subscribe(data => {
      this.userData = data;
    })
    if(this.studentExtraData) {
      try {
        this.studentDataForm.setValue(this.studentExtraData);
        this.studentDataForm.markAllAsTouched();
      } catch(err) { }
    }
  }

  saveData() {
    this.isSavingData = true;
    const formValue: StudentExtraData = this.studentDataForm.value;
    this.studentExtraData = formValue;
    this.dialog.close(this.studentExtraData);
  }

}