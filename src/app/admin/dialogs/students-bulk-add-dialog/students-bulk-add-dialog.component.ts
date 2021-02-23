import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-students-bulk-add-dialog',
  templateUrl: './students-bulk-add-dialog.component.html',
  styleUrls: ['./students-bulk-add-dialog.component.scss']
})
export class StudentsBulkAddDialogComponent implements OnInit {

  constructor(private admin: AdminService, private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<StudentsBulkAddDialogComponent>) { }

  loading: boolean = false;

  ngOnInit(): void { }

  handleFileInput(target: any) {
    const file: File = target.files[0];
    this.loading = true;
    this.admin.addStudentsBulk(file).subscribe(res => {
      if(res == null) {
        this.snackbar.open("A apărut o eroare.");
      } else {
        this.snackbar.open(`Au fost adăugați ${res.addedStudents}/${res.totalStudents} studenți.`);
      }
      this.dialogRef.close(true);
    })
  }

}
