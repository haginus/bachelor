import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportResultDialogComponent } from '../import-result-dialog/import-result-dialog.component';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-students-bulk-add-dialog',
  templateUrl: './students-bulk-add-dialog.component.html',
  styleUrls: ['./students-bulk-add-dialog.component.scss']
})
export class StudentsBulkAddDialogComponent implements OnInit {

  constructor(private admin: AdminService, private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<StudentsBulkAddDialogComponent>,
    private dialog: MatDialog) { }

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
        const stats = res.stats;
        const sbRef = this.snackbar.open(
          `${stats.addedRows} studenți au fost adăugați și ${stats.editedRows} editați din totalul de ${stats.totalRows} studenți. ${stats.invalidRows} linii au fost ignorate.`,
          'Vedeți rezultatele',
          { duration: 10000 }
        );
        sbRef.onAction().toPromise().then(() => {
          this.dialog.open(ImportResultDialogComponent, { data: res });
        });
      }
      this.dialogRef.close(true);
    })
  }

}
