import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription, firstValueFrom } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { Domain, UserData } from '../../../services/auth.service';
import { CNPValidator } from '../../../validators/CNP-validator';
import { StudentExtraDataEditorComponent, StudentExtraDataEditorData } from '../../../shared/components/student-extra-data-editor/student-extra-data-editor.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private admin: AdminService,
  ) { }

  domainSubscrition: Subscription;
  loadingDomains: boolean = true;;
  domains: Domain[];
  chosenDomain: Domain;
  isLoadingData: boolean = false;

  ngOnInit(): void {
    this.domainSubscrition = this.admin.getDomains().subscribe(domains => {
      this.loadingDomains = false;
      this.domains = domains;
      if(this.data.mode != 'view') {
        this.studentForm.get('domainId').enable();
        this.studentForm.get('specializationId').enable();
      }
      this.chosenDomain = domains.find(domain => domain.id == this.data.user?.student.domain.id);
      this.studentForm.get('domainId').valueChanges.subscribe(domainId => {
        this.chosenDomain = domains.find(domain => domain.id == domainId);
        this.specializationId.reset();
      });
    });
    if(this.data.mode == 'view') {
      this.studentForm.disable();
    }
    if(this.data.user == null && this.data.userId) {
      this.isLoadingData = true;
      this.admin.getStudentUser(this.data.userId).subscribe(data => {
        this.data.user = data;
        this.setControlValues();
        this.isLoadingData = false;
      });
    }
  }

  studentForm = new FormGroup({
    'firstName': new FormControl(this.data.user?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.user?.lastName, [Validators.required]),
    'CNP': new FormControl(this.data.user?.CNP, [CNPValidator]),
    'identificationCode': new FormControl(this.data.user?.student?.identificationCode, [Validators.required]),
    'email': new FormControl(this.data.user?.email, [Validators.email, Validators.required]),
    'domainId': new FormControl({ value: this.data.user?.student?.domainId, disabled: true }, [Validators.required]),
    'specializationId': new FormControl({ value: this.data.user?.student?.specializationId, disabled: true }, [Validators.required]),
    'promotion': new FormControl(this.data.user?.student?.promotion, [Validators.required]),
    'group': new FormControl(this.data.user?.student?.group, [Validators.required]),
    'matriculationYear': new FormControl(this.data.user?.student?.matriculationYear, [Validators.required]),
    'studyForm': new FormControl(this.data.user?.student?.studyForm, [Validators.required]),
    'fundingForm': new FormControl(this.data.user?.student?.fundingForm, [Validators.required])
  });

  get specializationId() {
    return this.studentForm.get("specializationId")
  }

  get emailChanged() {
    return this.data.mode == 'edit' && this.studentForm.get("email").value != this.data.user?.email;
  }

  private setControlValues() {
    this.studentForm.get("firstName").setValue(this.data.user.firstName);
    this.studentForm.get("lastName").setValue(this.data.user.lastName);
    this.studentForm.get("CNP").setValue(this.data.user.CNP);
    this.studentForm.get("email").setValue(this.data.user.email);
    this.studentForm.get("domainId").setValue(this.data.user.student.domainId);
    this.studentForm.get("specializationId").setValue(this.data.user.student.specializationId);
    this.studentForm.get("group").setValue(this.data.user.student.group);
    this.studentForm.get("identificationCode").setValue(this.data.user.student.identificationCode);
    this.studentForm.get("promotion").setValue(this.data.user.student.promotion);
    this.studentForm.get("matriculationYear").setValue(this.data.user.student.matriculationYear);
    this.studentForm.get("studyForm").setValue(this.data.user.student.studyForm);
    this.studentForm.get("fundingForm").setValue(this.data.user.student.fundingForm);
  }

  async addStudent() {
    const formData = this.studentForm.getRawValue();
    this.isLoadingData = true;
    const result = await firstValueFrom(this.admin.addStudent(formData));
    this.isLoadingData = false;
    if(result) {
      this.snackBar.open("Studentul a fost adăugat.");
      this.dialogRef.close(result);
    }
  }

  async editStudent() {
    const formData = {
      ...this.studentForm.getRawValue(),
      id: this.data.user.id
    };
    this.isLoadingData = true;
    const result = await firstValueFrom(this.admin.editStudent(formData));
    this.isLoadingData = false;
    if(result) {
      let message = "Studentul a fost modificat.";
      if(result.documentsGenerated) {
        message += " Documentele au fost regenerate.";
      }
      this.snackBar.open(message, null, { duration: 8000 });
      this.dialogRef.close(result);
    }
  }

  switchToEdit() {
    this.studentForm.enable({ emitEvent: false });
    this.data.mode = 'edit';
  }

  async editStudentExtraData() {
    try {
      this.isLoadingData = true;
      const user = await firstValueFrom(this.admin.getStudentUser(this.data.user!.id));
      const dialogRef = this.dialog.open(StudentExtraDataEditorComponent, {
        data: {
          studentExtraData: user.student!.studentExtraDatum,
          student: user
        } satisfies StudentExtraDataEditorData
      });
      const studentExtraData = await firstValueFrom(dialogRef.afterClosed());
      if(!studentExtraData) return;
      const result = await firstValueFrom(this.admin.editStudentExtraData(user.id, studentExtraData));
      if(result) {
        this.snackBar.open("Datele suplimentare au fost salvate.");
        this.dialogRef.close(true);
      }
    } catch(err) {
      console.error(err);
    } finally {
      this.isLoadingData = false;
    }
  }

  ngOnDestroy(): void {
    this.domainSubscrition.unsubscribe();
  }
}

export interface StudentDialogData {
  mode: "view" | "create" | "edit";
  user?: UserData;
  userId: number;
}
