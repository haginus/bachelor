import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService } from '../../../services/document.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UploadFileDirective } from '../../directives/upload-file.directive';
import { RequiredDocument } from '../../../lib/types';

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
  imports: [
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    UploadFileDirective,
  ]
})
export class DocumentUploadDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DocumentUploadDialogData,
    private dialogRef: MatDialogRef<DocumentUploadDialogComponent>,
    private document: DocumentService,
    private snackbar: MatSnackBar,
  ) {}

  isDownloadingGeneratedDocument: boolean = false;
  isUploadingFile: boolean = false;
  acceptedExtensions: string;

  ngOnInit(): void {
    this.acceptedExtensions = this.data.document.acceptedExtensions.join(', ');
  }

  handleFileInput(file: File) {
    this.isUploadingFile = true;
    this.document.uploadDocument(this.data.paperId, this.data.document.name, 'copy', file).subscribe(res => {
      if(res == null) {
        this.isUploadingFile = false;
      } else {
        this.snackbar.open(`Document încărcat.`);
        this.dialogRef.close(res);
      }
    })
  }

  downloadGeneratedDocument() {
    this.isDownloadingGeneratedDocument = true;
    this.document.getDocument(this.data.generatedDocumentId).subscribe(data => {
      if(data) {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.download = this.data.document.title;
        anchor.href = url;
        anchor.click();
      } else {
        this.snackbar.open("Descărcarea nu a reușit.");
      }
      this.isDownloadingGeneratedDocument = false;
    })
  }
}

export interface DocumentUploadDialogData {
  document: RequiredDocument;
  generatedDocumentId?: number;
  paperId: number;
}
