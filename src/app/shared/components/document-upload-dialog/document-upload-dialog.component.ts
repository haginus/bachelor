import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentsService } from '../../../services/documents.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UploadFileDirective } from '../../directives/upload-file.directive';
import { RequiredDocument } from '../../../lib/types';
import { firstValueFrom } from 'rxjs';
import { FilesService } from '../../../services/files.service';

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
    private document: DocumentsService,
    private filesService: FilesService,
    private snackbar: MatSnackBar,
  ) {}

  isDownloadingGeneratedDocument: boolean = false;
  isUploadingFile: boolean = false;
  acceptedExtensions: string;

  ngOnInit(): void {
    this.acceptedExtensions = this.data.document.acceptedExtensions.join(', ');
  }

  async handleFileInput(file: File) {
    this.isUploadingFile = true;
    try {
      const document = await firstValueFrom(this.document.uploadDocument(this.data.paperId, this.data.document.name, 'copy', file));
      this.snackbar.open(`Document încărcat.`);
      this.dialogRef.close(document);
    } finally {
      this.isUploadingFile = false;
    }
  }

  async downloadGeneratedDocument() {
    this.isDownloadingGeneratedDocument = true;
    try {
      const document = await firstValueFrom(this.document.getDocument(this.data.generatedDocumentId));
      this.filesService.saveFile(document, this.data.document.title);
    } finally {
      this.isDownloadingGeneratedDocument = false;
    }
  }
}

export interface DocumentUploadDialogData {
  document: RequiredDocument;
  generatedDocumentId?: number;
  paperId: number;
}
