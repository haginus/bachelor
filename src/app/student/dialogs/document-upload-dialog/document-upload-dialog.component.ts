import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentService } from 'src/app/services/student.service';
import { RequiredDocument } from '../../pages/paper/paper.component'

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss']
})
export class DocumentUploadDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DocumentUploadDialogData, private student: StudentService,
    private snackbar: MatSnackBar, private dialogRef: MatDialogRef<DocumentUploadDialogComponent>) { }

  mode: 'signDocument' | 'uploadDocument';
  state: 'initial' | 'docDownloaded';
  documentId: number = null;
  isLoadingFile: boolean = false;
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
    this.student.getDocument(this.documentId).subscribe(data => {
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
    this.isLoadingFile = true;
    this.student.uploadDocument(file, this.data.document.name, type).subscribe(res => {
      if(res == null) {
        this.snackbar.open("A apărut o eroare.");
        this.isLoadingFile = false;
      } else {
        this.snackbar.open(`Document încărcat.`);
        this.dialogRef.close(true);
      }
    })
  }
}

export interface DocumentUploadDialogData {
  document: RequiredDocument,
  action: 'sign' | 'uploadCopy',
  documentId: number
}
