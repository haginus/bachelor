import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserData } from '../../../services/auth.service';
import { TeachersService } from '../../../services/teachers.service';

@Component({
  selector: 'app-admin-teacher-delete-dialog',
  templateUrl: './teacher-delete-dialog.component.html',
  styleUrls: ['./teacher-delete-dialog.component.scss']
})
export class AdminTeacherDeleteDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserData, private teachersService: TeachersService) { }

  ngOnInit(): void {
  }

  deleteTeacher() {
    return this.teachersService.delete(this.data.id);
  }

}
