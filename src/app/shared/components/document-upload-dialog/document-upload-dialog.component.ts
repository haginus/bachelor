import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PaperRequiredDocument } from '../../../services/student.service';
import { DocumentService } from '../../../services/document.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UploadFileDirective } from '../../directives/upload-file.directive';

@Component({
  selector: 'app-document-upload-dialog',
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
  standalone: true,
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
}

export interface DocumentUploadDialogData {
  document: PaperRequiredDocument;
  paperId: number;
}
