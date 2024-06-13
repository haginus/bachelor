import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserData } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

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
