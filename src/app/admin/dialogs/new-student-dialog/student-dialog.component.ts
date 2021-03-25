import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { Domain, UserData } from 'src/app/services/auth.service';

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

  ngOnInit(): void {
    if(this.data.mode == 'create') {
      this.studentForm.get('email').enable();
    }
    this.domainSubscrition = this.admin.getDomains().subscribe(domains => {
      this.loadingDomains = false;
      this.domains = domains;
      if(this.data.mode != 'view') {
        this.studentForm.get('domainId').enable();
      }
    });
    if(this.data.mode == 'view') {
      this.studentForm.disable();
    }
  }

  studentForm = new FormGroup({
    'firstName': new FormControl(this.data.data?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.data?.lastName, [Validators.required]),
    'CNP': new FormControl(this.data.data?.CNP, [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
    'identificationCode': new FormControl(this.data.data?.student?.identificationCode, [Validators.required]),
    'email': new FormControl({ value: this.data.data?.email, disabled: true }, [Validators.email, Validators.required]),
    'domainId': new FormControl({ value: this.data.data?.student?.domainId, disabled: true }, [Validators.required]),
    //'domainSpecializationId': new FormControl({ value: this.data.data?.student?.domainId, disabled: true }, [Validators.required]),
    'promotion': new FormControl(this.data.data?.student?.promotion, [Validators.required]),
    'group': new FormControl(this.data.data?.student?.group, [Validators.required]),
  });

  private getControlValues() {
    const firstName = this.studentForm.get("firstName").value;
    const lastName = this.studentForm.get("lastName").value;
    const CNP = this.studentForm.get("CNP").value;
    const email = this.studentForm.get("email").value;
    const domainId = this.studentForm.get("domainId").value;
    const group = this.studentForm.get("group").value;
    const identificationCode = this.studentForm.get("identificationCode").value;
    const promotion = this.studentForm.get("promotion").value;

    return { firstName, lastName, CNP, email, group, domainId, identificationCode, promotion };
  }
  addStudent() {
    const { firstName, lastName, CNP, email, group, domainId, identificationCode, promotion } = this.getControlValues();
    return this.admin.addStudent(firstName, lastName, CNP, email, group, domainId, identificationCode, promotion);
  }

  editStudent() {
    const { firstName, lastName, CNP, group, domainId, identificationCode, promotion } = this.getControlValues();
    const id = this.data.data.id;
    return this.admin.editStudent(id, firstName, lastName, CNP, group, domainId, identificationCode, promotion);
  }

  ngOnDestroy(): void {
    this.domainSubscrition.unsubscribe();
  }
}

export interface StudentDialogData {
  mode: "view" | "create" | "edit";
  data?: UserData
}
