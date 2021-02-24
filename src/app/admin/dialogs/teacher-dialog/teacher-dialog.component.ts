import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { Domain, UserData } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-teacher-dialog',
  templateUrl: './teacher-dialog.component.html',
  styleUrls: ['./teacher-dialog.component.scss']
})
export class AdminTeacherDialogConmonent implements OnInit {

  constructor(private admin: AdminService, @Inject(MAT_DIALOG_DATA) public data: AdminTeacherDialogData) { }

  loadingDomains: boolean = true;;
  domains: Domain[];

  ngOnInit(): void {
    if(this.data.mode == 'create') {
      this.teacherForm.get('email').enable();
    }
  }

  teacherForm = new FormGroup({
    'firstName': new FormControl(this.data.data?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.data?.lastName, [Validators.required]),
    'CNP': new FormControl(this.data.data?.CNP, [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
    'email': new FormControl({ value: this.data.data?.email, disabled: true }, [Validators.email, Validators.required]),
  });

  private getControlValues() {
    const firstName = this.teacherForm.get("firstName").value;
    const lastName = this.teacherForm.get("lastName").value;
    const CNP = this.teacherForm.get("CNP").value;
    const email = this.teacherForm.get("email").value;

    return { firstName, lastName, CNP, email };
  }

  addTeacher() {
    const { firstName, lastName, CNP, email } = this.getControlValues();
    return this.admin.addTeacher(firstName, lastName, CNP, email);
  }

  editTeacher() {
    const { firstName, lastName, CNP, email } = this.getControlValues();
    const id = this.data.data.id;
    return this.admin.editTeacher(id, firstName, lastName, CNP);
  }

}

export interface AdminTeacherDialogData {
  mode: "view" | "create" | "edit";
  data?: UserData
}
