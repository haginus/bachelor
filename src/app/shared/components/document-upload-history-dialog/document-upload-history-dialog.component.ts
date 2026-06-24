import { Component, Inject } from '@angular/core';
import { DocumentsService } from '../../../services/documents.service';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { first, firstValueFrom } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Document, RequiredDocument } from '../../../lib/types';
import { FilesService } from '../../../services/files.service';

@Component({
  selector: 'app-document-upload-history-dialog',
  imports: [
    MatDialogModule,
    MatIcon,
    MatButtonModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  templateUrl: './document-upload-history-dialog.component.html',
  styleUrl: './document-upload-history-dialog.component.scss'
})
export class DocumentUploadHistoryDialogComponent {

  history: Document[] = [];
  isLoading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DocumentUploadHistoryDialogData,
    private documentsService: DocumentsService,
    private filesService: FilesService,
  ) {
    this.documentsService.getDocumentUploadHistory(this.data.paperId, this.data.document.name)
      .pipe(first())
      .subscribe((history) => {
        this.history = history;
        this.isLoading = false;
      });
  }

  async viewDocument(document: Document, version: number) {
    const title = `[Versiunea ${version} - #${document.id}] ${this.data.document.title}`;
    const file = await firstValueFrom(this.documentsService.getDocument(document.id));
    this.filesService.viewFile(new File([file], title, { type: document.mimeType }));
  }

  readonly documentTypes: Record<Document['type'], string> = {
    'generated': 'Generat',
    'signed': 'Semnat',
    'copy': 'Copie',
  }

}

export interface DocumentUploadHistoryDialogData {
  paperId: number;
  document: RequiredDocument;
}
