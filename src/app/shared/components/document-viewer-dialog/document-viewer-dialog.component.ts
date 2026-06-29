import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, EventEmitter, HostListener, inject, Inject, Output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../loading/loading.component';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { SignDialogComponent } from '../sign-dialog/sign-dialog.component';
import { firstValueFrom } from 'rxjs';
import { Document, RequiredDocument } from '../../../lib/types';
import { DocxViewerComponent } from '../docx-viewer/docx-viewer.component';
import { XlsxViewerComponent } from '../xlsx-viewer/xlsx-viewer.component';

@Component({
  selector: 'app-document-viewer-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    LoadingComponent,
    PdfViewerComponent,
    DocxViewerComponent,
    XlsxViewerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-viewer-dialog.component.html',
  styleUrl: './document-viewer-dialog.component.scss'
})
export class DocumentViewerDialogComponent {

  static supportedTypes = [
    'application/pdf',
    'image/*',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  static browserSupportedTypes = [
    'application/pdf',
    'image/*',
  ];

  static _supportsType(type: string, typeList: string[]): boolean {
    return typeList.some(supportedType => {
      const regex = new RegExp(supportedType.replace('*', '.*'));
      return regex.test(type);
    });
  }

  static supportsType(type: string): boolean {
    return DocumentViewerDialogComponent._supportsType(type, DocumentViewerDialogComponent.supportedTypes);
  }

  protected data = inject(MAT_DIALOG_DATA) as DocumentViewerDialogData;
  protected dialogRef = inject(MatDialogRef<DocumentViewerDialogComponent>);
  protected dialog = inject(MatDialog);
  protected cd = inject(ChangeDetectorRef);

  protected file = signal(this.data.file);
  protected resourceUrl = computed(() => window.URL.createObjectURL(this.file()));
  protected previewSupported = computed(() => DocumentViewerDialogComponent.supportsType(this.file().type));
  protected openInNewTabSupported = computed(() => DocumentViewerDialogComponent._supportsType(this.file().type, DocumentViewerDialogComponent.browserSupportedTypes));
  protected errorLoading = signal(false);
  protected isLoading = signal(true);
  protected documentTitle = computed(() => this.file().name || 'Document');
  @Output() documentSigned = new EventEmitter<Document>();


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
    window.open(this.resourceUrl(), '_blank');
  }

  downloadResource() {
    const anchor = document.createElement('a');
    anchor.href = this.resourceUrl();
    anchor.download = this.documentTitle();
    anchor.click();
  }

  async openSignDialog() {
    const dialogRef = this.dialog.open(SignDialogComponent, {
      data: this.data.signOptions,
      autoFocus: '.sign-button',
    });
    const result = await firstValueFrom<{ document: Document; content: File; }>(dialogRef.afterClosed());
    if(result) {
      this.file.set(result.content);
      this.data.signOptions = undefined;
      this.cd.detectChanges();
      this.documentSigned.emit(result.document);
    }
  }

}

export interface DocumentViewerDialogData {
  file: File;
  signOptions?: {
    requiredDocument: RequiredDocument;
    paperId: number;
    signUserId?: number;
  }
}
