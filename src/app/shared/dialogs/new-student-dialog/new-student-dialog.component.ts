import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { Domain } from 'src/app/services/auth.service';

@Component({
  selector: 'app-new-student-dialog',
  templateUrl: './new-student-dialog.component.html',
  styleUrls: ['./new-student-dialog.component.scss']
})
export class NewStudentDialogComponent implements OnInit {

  constructor(private admin: AdminService) { }

  ngOnInit(): void { }

  studentForm = new FormGroup({
    'firstName': new FormControl(null, [Validators.required]),
    'lastName': new FormControl(null, [Validators.required]),
    'CNP': new FormControl(null, [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
    'email': new FormControl(null, [Validators.email, Validators.required]),
    'domainId': new FormControl(null, [Validators.required]),
    'group': new FormControl(null, [Validators.required]),
  });

  domains: Observable<Domain[]> = this.admin.getDomains();

  addStudent() {
    const firstName = this.studentForm.get("firstName").value;
    const lastName = this.studentForm.get("lastName").value;
    const CNP = this.studentForm.get("CNP").value;
    const email = this.studentForm.get("email").value;
    const domainId = this.studentForm.get("domainId").value;
    const group = this.studentForm.get("group").value;

    return this.admin.addStudent(firstName, lastName, CNP, email, group, domainId);
  }

}
