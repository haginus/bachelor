import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { Domain, UserData } from '../../../services/auth.service';
import { CNPValidator } from '../../../validators/CNP-validator';

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

  }

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

  private getControlValues() {
    const title = this.teacherForm.get("title").value;
    const firstName = this.teacherForm.get("firstName").value;
    const lastName = this.teacherForm.get("lastName").value;
    const CNP = this.teacherForm.get("CNP").value;
    const email = this.teacherForm.get("email").value;

    return { title, firstName, lastName, CNP, email };
  }

  addTeacher() {
    const { title, firstName, lastName, CNP, email } = this.getControlValues();
    return this.admin.addTeacher(title, firstName, lastName, CNP, email);
  }

  editTeacher() {
    const { title, firstName, lastName, CNP, email } = this.getControlValues();
    const id = this.data.data.id;
    return this.admin.editTeacher(id, title, firstName, lastName, CNP, email);
  }

}

export interface AdminTeacherDialogData {
  mode: "view" | "create" | "edit";
  data?: UserData;
}
