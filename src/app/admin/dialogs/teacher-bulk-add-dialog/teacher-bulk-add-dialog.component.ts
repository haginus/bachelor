import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-teacher-bulk-add-dialog',
  templateUrl: './teacher-bulk-add-dialog.component.html',
  styleUrls: ['./teacher-bulk-add-dialog.component.scss']
})
export class AdminTeacherBulkAddDialogComponent implements OnInit {

  constructor(private admin: AdminService, private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<AdminTeacherBulkAddDialogComponent>) { }

  loading: boolean = false;

  ngOnInit(): void { }

  handleFileInput(target: any) {
    const file: File = target.files[0];
    this.loading = true;
    this.admin.addTeachersBulk(file).subscribe(res => {
      if(res) {
        this.snackbar.open(`Au fost adăugați ${res.addedTeachers}/${res.totalTeachers} profesori.`);
      }
      this.dialogRef.close(true);
    })
  }

}
