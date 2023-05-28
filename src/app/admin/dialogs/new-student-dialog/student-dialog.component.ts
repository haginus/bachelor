import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { Domain, UserData } from 'src/app/services/auth.service';
import { CNPValidator } from 'src/app/validators/CNP-validator';

@Component({
  selector: 'app-student-dialog',
  templateUrl: './student-dialog.component.html',
  styleUrls: ['./student-dialog.component.scss']
})
export class StudentDialogComponent implements OnInit {

  constructor(private admin: AdminService, @Inject(MAT_DIALOG_DATA) public data: StudentDialogData) { }

  domainSubscrition: Subscription;
  loadingDomains: boolean = true;;
  domains: Domain[];
  chosenDomain: Domain;
  isLoadingData: boolean = false;

  ngOnInit(): void {
    if(this.data.mode == 'create') {
      this.studentForm.get('email').enable();
    }
    this.domainSubscrition = this.admin.getDomains().subscribe(domains => {
      this.loadingDomains = false;
      this.domains = domains;
      if(this.data.mode != 'view') { // create or edit
        this.studentForm.get('domainId').enable();
        this.studentForm.get('specializationId').enable();
        this.chosenDomain = domains.find(domain => domain.id == this.data.data?.student.domain.id);
        this.studentForm.get('domainId').valueChanges.subscribe(domainId => { 
          this.chosenDomain = domains.find(domain => domain.id == domainId);
          this.specializationId.reset();
        })
      }
    });
    if(this.data.mode == 'view') {
      this.studentForm.disable();
    }
    if(this.data.data == null && this.data.userId) {
      this.isLoadingData = true;
      this.admin.getStudentUser(this.data.userId).subscribe(data => {
        this.data.data = data;
        this.setControlValues();
        this.isLoadingData = false;
      });
    }
  }

  studentForm = new FormGroup({
    'firstName': new FormControl(this.data.data?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.data?.lastName, [Validators.required]),
    'CNP': new FormControl(this.data.data?.CNP, [CNPValidator]),
    'identificationCode': new FormControl(this.data.data?.student?.identificationCode, [Validators.required]),
    'email': new FormControl(this.data.data?.email, [Validators.email, Validators.required]),
    'domainId': new FormControl({ value: this.data.data?.student?.domainId, disabled: true }, [Validators.required]),
    'specializationId': new FormControl({ value: this.data.data?.student?.specializationId, disabled: true }, [Validators.required]),
    'promotion': new FormControl(this.data.data?.student?.promotion, [Validators.required]),
    'group': new FormControl(this.data.data?.student?.group, [Validators.required]),
    'matriculationYear': new FormControl(this.data.data?.student?.matriculationYear, [Validators.required]),
    'studyForm': new FormControl(this.data.data?.student?.studyForm, [Validators.required]),
    'fundingForm': new FormControl(this.data.data?.student?.fundingForm, [Validators.required])
  });

  get specializationId() { 
    return this.studentForm.get("specializationId")
  }

  get emailChanged() { 
    return this.data.mode == 'edit' && this.studentForm.get("email").value != this.data.data?.email;
  }

  private setControlValues() {
    this.studentForm.get("firstName").setValue(this.data.data.firstName);
    this.studentForm.get("lastName").setValue(this.data.data.lastName);
    this.studentForm.get("CNP").setValue(this.data.data.CNP);
    this.studentForm.get("email").setValue(this.data.data.email);
    this.studentForm.get("domainId").setValue(this.data.data.student.domainId);
    this.studentForm.get("specializationId").setValue(this.data.data.student.specializationId);
    this.studentForm.get("group").setValue(this.data.data.student.group);
    this.studentForm.get("identificationCode").setValue(this.data.data.student.identificationCode);
    this.studentForm.get("promotion").setValue(this.data.data.student.promotion);
    this.studentForm.get("matriculationYear").setValue(this.data.data.student.matriculationYear);
    this.studentForm.get("studyForm").setValue(this.data.data.student.studyForm);
    this.studentForm.get("fundingForm").setValue(this.data.data.student.fundingForm);
  }

  private getControlValues() {
    const firstName = this.studentForm.get("firstName").value;
    const lastName = this.studentForm.get("lastName").value;
    const CNP = this.studentForm.get("CNP").value;
    const email = this.studentForm.get("email").value;
    const domainId = this.studentForm.get("domainId").value;
    const specializationId = this.studentForm.get("specializationId").value;
    const group = this.studentForm.get("group").value;
    const identificationCode = this.studentForm.get("identificationCode").value;
    const promotion = this.studentForm.get("promotion").value;
    const matriculationYear = this.studentForm.get("matriculationYear").value;
    const studyForm = this.studentForm.get("studyForm").value;
    const fundingForm = this.studentForm.get("fundingForm").value;

    return { firstName, lastName, CNP, email, group, domainId, specializationId, identificationCode, promotion,
    matriculationYear, studyForm, fundingForm };
  }
  addStudent() {
    const { firstName, lastName, CNP, email, group, specializationId, identificationCode, promotion,
      studyForm, fundingForm, matriculationYear, } = this.getControlValues();
    return this.admin.addStudent(firstName, lastName, CNP, email, group, specializationId, identificationCode, promotion,
      studyForm, fundingForm, matriculationYear);
  }

  editStudent() {
    const { firstName, lastName, CNP, email, group, specializationId, identificationCode, promotion,
      studyForm, fundingForm, matriculationYear} = this.getControlValues();
    const id = this.data.data.id;
    return this.admin.editStudent(id, firstName, lastName, CNP, email, group, specializationId, identificationCode, promotion,
      studyForm, fundingForm, matriculationYear);
  }

  ngOnDestroy(): void {
    this.domainSubscrition.unsubscribe();
  }
}

export interface StudentDialogData {
  mode: "view" | "create" | "edit";
  data?: UserData,
  userId: number
}
