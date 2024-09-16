import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../loading/loading.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { PaperRequiredDocument } from '../paper-document-list/paper-document-list.component';
import { SignDialogComponent } from '../sign-dialog/sign-dialog.component';
import { firstValueFrom } from 'rxjs';
import { PaperDocument } from '../../../services/auth.service';

@Component({
  selector: 'app-document-viewer-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    LoadingComponent,
    PdfViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-viewer-dialog.component.html',
  styleUrl: './document-viewer-dialog.component.scss'
})
export class DocumentViewerDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: DocumentViewerDialogData,
    private readonly dialogRef: MatDialogRef<DocumentViewerDialogComponent>,
    private readonly dialog: MatDialog,
    private readonly cd: ChangeDetectorRef,
  ) {
    const supportedTypes = ['application/pdf', 'image/*'];
    this.previewSupported = supportedTypes.some(type => {
      const regex = new RegExp(type.replace('*', '.*'));
      return regex.test(data.type);
    });
    this.isLoading = !!this.previewSupported;
  }

  documentTitle = this.data.title || 'Document';
  previewSupported: boolean;
  errorLoading = false;
  isLoading = true;
  @Output() documentSigned = new EventEmitter<PaperDocument>();

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key.toLocaleUpperCase() === 'S' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.downloadResource();
    }
  }

  findbarVisibleChange(visible: boolean) {
    setTimeout(() => this.dialogRef.disableClose = visible, 1);
  }

  openInNewTab() {
    window.open(this.data.url, '_blank');
  }

  downloadResource() {
    const anchor = document.createElement('a');
    anchor.href = this.data.url;
    anchor.download = this.documentTitle;
    anchor.click();
  }

  async openSignDialog() {
    const dialogRef = this.dialog.open(SignDialogComponent, {
      data: this.data.signOptions,
      autoFocus: '.sign-button',
    });
    const result = await firstValueFrom<{ document: PaperDocument, content: ArrayBuffer }>(dialogRef.afterClosed());
    if(result) {
      const blob = new Blob([result.content], { type: result.document.mimeType });
      this.data.url = window.URL.createObjectURL(blob);
      this.data.signOptions = undefined;
      this.cd.detectChanges();
      this.documentSigned.emit(result.document);
    }
  }

}

export interface DocumentViewerDialogData {
  url: string;
  type: string;
  title: string;
  signOptions?: {
    requiredDocument: PaperRequiredDocument;
    paperId: number;
  }
}
