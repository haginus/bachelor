import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserData } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { StudentsService } from '../../../services/students.service';

@Component({
  selector: 'app-student-delete-dialog',
  templateUrl: './student-delete-dialog.component.html',
  styleUrls: ['./student-delete-dialog.component.scss']
})
export class StudentDeleteDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserData, private studentsService: StudentsService) { }

  ngOnInit(): void {
  }

  deleteStudent() {
    return this.studentsService.delete(this.data.id);
  }

}
