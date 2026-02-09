import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeachersService } from '../../../services/teachers.service';
import { User } from '../../../lib/types';

@Component({
  selector: 'app-admin-teacher-delete-dialog',
  templateUrl: './teacher-delete-dialog.component.html',
  styleUrls: ['./teacher-delete-dialog.component.scss'],
  standalone: false
})
export class AdminTeacherDeleteDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: User, private teachersService: TeachersService) { }

  ngOnInit(): void {
  }

  deleteTeacher() {
    return this.teachersService.delete(this.data.id);
  }

}
