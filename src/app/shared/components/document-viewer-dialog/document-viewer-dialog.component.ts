import { ChangeDetectionStrategy, Component, HostListener, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingComponent } from '../loading/loading.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';

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
    sanitizer: DomSanitizer,
  ) {
    const supportedTypes = ['application/pdf', 'image/*'];
    this.previewSupported = supportedTypes.some(type => {
      const regex = new RegExp(type.replace('*', '.*'));
      return regex.test(data.type);
    });
    this.isLoading = !!this.previewSupported;
    this.resourceUrl = this.previewSupported
      ? sanitizer.bypassSecurityTrustResourceUrl(data.url)
      : null;
  }

  documentTitle = this.data.title || 'Document';
  previewSupported: boolean;
  errorLoading = false;
  isLoading = true;
  resourceUrl: SafeResourceUrl;

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

}

interface DocumentViewerDialogData {
  url: string;
  type: string;
  title: string;
}
