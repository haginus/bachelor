import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, delay, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { CNPValidator } from '../../../validators/CNP-validator';
import { UserExtraDataEditorComponent, UserExtraDataEditorData } from '../../../shared/components/user-extra-data-editor/user-extra-data-editor.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Domain, Student, UserExtraData } from '../../../lib/types';
import { DomainsService } from '../../../services/domains.service';
import { StudentsService } from '../../../services/students.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-student-dialog',
  templateUrl: './student-dialog.component.html',
  styleUrls: ['./student-dialog.component.scss']
})
export class StudentDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: StudentDialogData,
    private readonly dialogRef: MatDialogRef<StudentDialogComponent>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private readonly domainsService: DomainsService,
    private readonly studentsService: StudentsService,
    private readonly auth: AuthService,
  ) {}

  loadingDomains: boolean = true;;
  domains: Domain[];
  chosenDomain: Domain;
  isLoadingData: boolean = false;

  async ngOnInit() {
    try {
      this.domains = await firstValueFrom(this.domainsService.findAll());
      this.loadingDomains = false;
      if(this.data.mode != 'view') {
        this.studentForm.get('domainId').enable();
        this.studentForm.get('specializationId').enable();
      }
      this.chosenDomain = this.domains.find(domain => domain.id == this.data.user?.specialization.domain!.id);
      this.studentForm.get('domainId').valueChanges.subscribe(domainId => {
        this.chosenDomain = this.domains.find(domain => domain.id == domainId);
        this.specializationId.reset();
      });
    } finally {
      this.loadingDomains = false;
    }
    if(this.data.mode == 'view') {
      this.studentForm.disable();
    }
    if(this.data.user == null && this.data.userId) {
      this.isLoadingData = true;
      try {
        this.data.user = await firstValueFrom(this.studentsService.findOne(this.data.userId));
        this.setControlValues();
      } catch(err) {
        this.dialogRef.close();
      } finally {
        this.isLoadingData = false;
      }
    }
  }

  private readonly emailValidator = (existingId?: number) => {
    let prevEmail = '', prevResult: ValidationErrors | null = null;
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = control.value?.trim() || '';
      if(!email) {
        return of(null);
      }
      if(email === prevEmail) {
        return of(prevResult);
      }
      return of(email).pipe(
        delay(500),
        // TODO: use backend
        switchMap(() => of({ existingId: null })),
        map((result) => (result.existingId == null || result.existingId === existingId) ? null : { emailUnique: 'Emailul este deja folosit.' }),
        tap(result => {
          prevEmail = email;
          prevResult = result;
        })
      );
    };
  }

  studentForm = new FormGroup({
    'firstName': new FormControl(this.data.user?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.user?.lastName, [Validators.required]),
    'CNP': new FormControl(this.data.user?.CNP, [CNPValidator]),
    'identificationCode': new FormControl(this.data.user?.identificationCode, [Validators.required]),
    'email': new FormControl(this.data.user?.email, {
      validators: [Validators.required, Validators.email],
      asyncValidators: this.emailValidator(this.data.user?.id || this.data.userId),
    }),
    'domainId': new FormControl({ value: this.data.user?.specialization.domain.id, disabled: true }, [Validators.required]),
    'specializationId': new FormControl({ value: this.data.user?.specialization.id, disabled: true }, [Validators.required]),
    'promotion': new FormControl(this.data.user?.promotion, [Validators.required]),
    'group': new FormControl(this.data.user?.group, [Validators.required]),
    'matriculationYear': new FormControl(this.data.user?.matriculationYear, [Validators.required]),
    'fundingForm': new FormControl(this.data.user?.fundingForm, [Validators.required]),
    'merge': new FormControl(false),
  });

  get specializationId() {
    return this.studentForm.get("specializationId")
  }

  get email() {
    return this.studentForm.get("email")!;
  }

  get emailChanged() {
    return this.data.mode == 'edit' && this.email.value != this.data.user?.email;
  }

  private setControlValues() {
    this.studentForm.get("firstName").setValue(this.data.user.firstName);
    this.studentForm.get("lastName").setValue(this.data.user.lastName);
    this.studentForm.get("CNP").setValue(this.data.user.CNP);
    this.studentForm.get("email").setValue(this.data.user.email);
    this.studentForm.get("domainId").setValue(this.data.user.specialization.domain.id);
    this.studentForm.get("specializationId").setValue(this.data.user.specialization.id);
    this.studentForm.get("group").setValue(this.data.user.group);
    this.studentForm.get("identificationCode").setValue(this.data.user.identificationCode);
    this.studentForm.get("promotion").setValue(this.data.user.promotion);
    this.studentForm.get("matriculationYear").setValue(this.data.user.matriculationYear);
    this.studentForm.get("fundingForm").setValue(this.data.user.fundingForm);
    this.studentForm.get("merge").setValue(false);
  }

  mergeAccounts() {
    this.studentForm.get("merge")!.setValue(true);
    this.email.setErrors(null);
  }

  async saveStudent() {
    const formData = this.studentForm.getRawValue();
    this.isLoadingData = true;
    try {
      const result = this.data.mode === 'create'
        ? await firstValueFrom(this.studentsService.create(formData))
        : await firstValueFrom(this.studentsService.update(this.data.user!.id, formData));
      let message = 'Studentul a fost salvat.';
      if(this.data.mode === 'edit' && 'documentsGenerated' in result && result.documentsGenerated) {
        message += ' Documentele au fost regenerate.';
      }
      this.snackBar.open(message);
      this.dialogRef.close(result);
    } finally {
      this.isLoadingData = false;
    }
  }

  switchToEdit() {
    this.studentForm.enable({ emitEvent: false });
    this.data.mode = 'edit';
  }

  async editUserExtraData() {
    try {
      this.isLoadingData = true;
      const extraData = await firstValueFrom(this.auth.getUserExtraData(this.data.user!.id));
      const dialogRef = this.dialog.open(UserExtraDataEditorComponent, {
        data: {
          extraData: extraData,
          user: this.data.user!,
        } satisfies UserExtraDataEditorData
      });
      await firstValueFrom(dialogRef.afterClosed()) as { result: UserExtraData; } | undefined;
    } catch(err) {
      console.error(err);
    } finally {
      this.isLoadingData = false;
    }
  }

}

export interface StudentDialogData {
  mode: "view" | "create" | "edit";
  user?: Student;
  userId: number;
}
