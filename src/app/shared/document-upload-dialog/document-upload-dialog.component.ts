import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { DocumentService } from 'src/app/services/document.service';
import { PaperRequiredDocument, StudentService } from 'src/app/services/student.service';
import { TeacherService } from 'src/app/services/teacher.service';

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss']
})
export class DocumentUploadDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DocumentUploadDialogData, private student: StudentService,
  private teacher: TeacherService, private document: DocumentService,
  private snackbar: MatSnackBar, private dialogRef: MatDialogRef<DocumentUploadDialogComponent>) { }

  mode: 'signDocument' | 'uploadDocument';
  state: 'initial' | 'docDownloaded';
  documentId: number = null;
  isLoadingFile: boolean = false;
  isUploadingFile: boolean = false;
  acceptedExtensions: string;

  ngOnInit(): void {
    if(this.data.action == 'sign') {
      this.mode = 'signDocument';
      this.state = 'initial';
      this.documentId = this.data.documentId;
    } else {
      this.mode = 'uploadDocument';
    }
    this.acceptedExtensions = this.data.document.acceptedExtensions.join(', ');
  }

  downloadDocument() {
    this.isLoadingFile = true;
    this.document.getDocument(this.documentId).subscribe(data => {
      if(data) {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.download = this.data.document.title;
        anchor.href = url;
        anchor.click();
        this.state = 'docDownloaded';
      } else {
        this.snackbar.open("Descărcarea nu a reușit.");
      }
      this.isLoadingFile = false;
    })
  }

  handleFileInput(target: any, type: string) {
    const file: File = target.files[0];
    this.isUploadingFile = true;
    let ob: Observable<any>;
    switch(this.data.document.uploadBy) {
      case 'student':
        ob = this.student.uploadDocument(file, this.data.document.name, type);
        break;
      case 'teacher':
        ob = this.teacher.uploadDocument(this.data.paperId, this.data.perspective, file, this.data.document.name, type);
        break;
      default:
        ob = of(null);
    }
    ob.subscribe(res => {
      if(res == null) {
        this.snackbar.open("A apărut o eroare.");
        this.isUploadingFile = false;
        target.value = null;
      } else {
        this.snackbar.open(`Document încărcat.`);
        this.dialogRef.close(res);
      }
    })
  }
}

export interface DocumentUploadDialogData {
  document: PaperRequiredDocument,
  action: 'sign' | 'uploadCopy',
  documentId: number,
  paperId: number;
  perspective?: 'teacher';
}
