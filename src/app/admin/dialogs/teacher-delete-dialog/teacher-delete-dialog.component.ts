import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';
import { UserData } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-teacher-delete-dialog',
  templateUrl: './teacher-delete-dialog.component.html',
  styleUrls: ['./teacher-delete-dialog.component.scss']
})
export class AdminTeacherDeleteDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserData, private admin: AdminService) { }

  ngOnInit(): void {
  }

  deleteTeacher() {
    return this.admin.deleteUser(this.data.id);
  }

}
