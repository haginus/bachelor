import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
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

  domains = this.admin.getDomains();

  studentForm = new FormGroup({
    'specializationId': new FormControl(null, [Validators.required]),
    'studyForm': new FormControl(null, [Validators.required])
  });

  handleFileInput(target: any) {
    const file: File = target.files[0];
    this.loading = true;
    const { specializationId, studyForm } = this.studentForm.value;
    this.admin.addStudentsBulk(file, specializationId, studyForm).subscribe(res => {
      if(res == null) {
      } else {
        this.snackbar.open(`Au fost adăugați ${res.addedStudents}/${res.totalStudents} studenți.`);
      }
      this.dialogRef.close(true);
    })
  }

}
