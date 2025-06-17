import { Component, Inject } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PaperRequiredDocument } from '../paper-document-list/paper-document-list.component';
import { first, firstValueFrom } from 'rxjs';
import { PaperDocument } from '../../../services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-upload-history-dialog',
  standalone: true,
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

  history: PaperDocument[] = [];
  isLoading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DocumentUploadHistoryDialogData,
    private document: DocumentService,
    private sb: MatSnackBar,
  ) {
    this.document.getDocumentUploadHistory(this.data.paperId, this.data.document.name)
      .pipe(first())
      .subscribe((history) => {
        this.history = history;
        this.isLoading = false;
      });
  }

  async viewDocument(document: PaperDocument, version: number) {
    const title = `[Versiunea ${version} - #${document.id}] ${this.data.document.title}`;
    const sbRef = this.sb.open("Se descarcă documentul...", null, {
      duration: null,
    });
    const buffer = await firstValueFrom(this.document.getDocument(document.id));
    sbRef.dismiss();
    if(buffer) {
      this.document.viewDocument(buffer, document.mimeType, title);
    }
  }

  readonly documentTypes: Record<PaperDocument['type'], string> = {
    'generated': 'Generat',
    'signed': 'Semnat',
    'copy': 'Copie',
  }

}

export interface DocumentUploadHistoryDialogData {
  paperId: number;
  document: PaperRequiredDocument;
}
