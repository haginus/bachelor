import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { countries } from '../../../lib/countries';
import { counties_ro } from '../../../lib/counties_ro';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { User, UserExtraData } from '../../../lib/types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-user-extra-data-editor',
  templateUrl: './user-extra-data-editor.component.html',
  styleUrls: ['./user-extra-data-editor.component.scss'],
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
    MatDatepickerModule,
  ],
  providers: [
    provideNativeDateAdapter(),
  ]
})
export class UserExtraDataEditorComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) dialogData: UserExtraDataEditorData,
    private dialog: MatDialogRef<UserExtraDataEditorComponent>,
    private snackBar: MatSnackBar,
    private readonly auth: AuthService,
  ) {
    this.studentExtraData = dialogData.extraData;
    this.userData = dialogData.user;

    this.placeOfBirthCountry.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.placeOfBirthCounty.setValue('');
    });

    this.placeOfBirthCounty.valueChanges.pipe(takeUntilDestroyed()).subscribe((county) => {
      if(this.placeOfBirthCountry.value === 'România' && county.startsWith('Sector')) {
        this.placeOfBirthLocality.setValue('București');
        this.placeOfBirthLocality.disable();
      } else {
        this.placeOfBirthLocality.enable();
      }
    });

    this.addressCountry.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.addressCounty.setValue('');
    });

    this.addressCounty.valueChanges.pipe(takeUntilDestroyed()).subscribe((county) => {
      if(this.addressCountry.value === 'România' && county.startsWith('Sector')) {
        this.addressLocality.setValue('București');
        this.addressLocality.disable();
      } else {
        this.addressLocality.enable();
      }
    });

  }

  studentExtraData: UserExtraData;
  userData: User;
  isSavingData: boolean = false;

  countries = Object.values(countries);
  counties_ro = Object.values(counties_ro);

  studentDataForm = new FormGroup({
    "birthLastName": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "parentInitial": new FormControl(null, [Validators.required, Validators.pattern(/^[A-ZĂÎȘȚ]\.( [A-ZĂÎȘȚ]\.){0,2}$/)]),
    "fatherName": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "motherName": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "civilState": new FormControl(null, [Validators.required]),
    "dateOfBirth": new FormControl(null, [Validators.required]),
    "citizenship": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "ethnicity": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "placeOfBirthCountry": new FormControl('România', [Validators.required, Validators.maxLength(128)]),
    "placeOfBirthCounty": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "placeOfBirthLocality": new FormControl(null, [Validators.required, Validators.maxLength(128)]),
    "landline": new FormControl(null, [Validators.required, Validators.pattern(/^((\+[0-9]{11})|([0-9]{10}))$/)]),
    "mobilePhone": new FormControl(null, [Validators.required, Validators.pattern(/^((\+[0-9]{11})|([0-9]{10}))$/)]),
    "personalEmail": new FormControl(null, [Validators.required, Validators.email]),
    "address": new FormGroup({
      "country": new FormControl('România', [Validators.required]),
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

  get placeOfBirthCountry() {
    return this.studentDataForm.get('placeOfBirthCountry') as FormControl<string>;
  }

  get placeOfBirthCounty() {
    return this.studentDataForm.get('placeOfBirthCounty') as FormControl<string>;
  }

  get placeOfBirthLocality() {
    return this.studentDataForm.get('placeOfBirthLocality') as FormControl<string>;
  }

  get addressCountry() {
    return this.studentDataForm.get('address')!.get('country')! as FormControl<string>;
  }

  get addressCounty() {
    return this.studentDataForm.get('address')!.get('county')! as FormControl<string>;
  }

  get addressLocality() {
    return this.studentDataForm.get('address')!.get('locality')! as FormControl<string>;
  }

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

  async saveData() {
    this.isSavingData = true;
    try {
      const formValue = this.studentDataForm.getRawValue() as UserExtraData;
      this.studentExtraData = formValue;
      const result = await firstValueFrom(this.auth.updateUserExtraData(this.userData.id, formValue));
      this.dialog.close(result);
      let message = "Datele suplimentare au fost salvate.";
      if('documentsGenerated' in result && result.documentsGenerated) {
        message += " Documentele vor fi regenerate.";
      }
      this.snackBar.open(message);
    } finally {
      this.isSavingData = false;
    }
  }

}

export interface UserExtraDataEditorData {
  extraData: UserExtraData | null;
  user: User;
}
