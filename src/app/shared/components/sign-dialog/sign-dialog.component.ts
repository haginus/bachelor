import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SignaturesService } from '../../../services/signatures.service';
import { Signature } from '../../../lib/types';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { fileToBase64 } from '../../../lib/utils';
import { DocumentViewerDialogData } from '../document-viewer-dialog/document-viewer-dialog.component';
import { DocumentService } from '../../../services/document.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingComponent } from '../loading/loading.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sign-dialog',
  standalone: true,
  imports: [
    SignaturePadComponent,
    LoadingComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sign-dialog.component.html',
  styleUrl: './sign-dialog.component.scss'
})
export class SignDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) protected readonly signOptions: DocumentViewerDialogData['signOptions'],
    private readonly dialogRef: MatDialogRef<SignDialogComponent>,
    private readonly auth: AuthService,
    private readonly signaturesService: SignaturesService,
    private readonly documentsService: DocumentService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {
    this.loadSignature();
  }

  @ViewChild('createSampleTemplate') createSampleTemplate: TemplateRef<any>;
  signature: Signature = null;
  loadingSignature = true;
  signatureError = false;
  loadingSubmit = false;
  userId!: number;
  signatureUserId!: number;

  private async loadSignature() {
    this.loadingSignature = true;
    this.userId = (await firstValueFrom(this.auth.userData)).id;
    this.signatureUserId = this.signOptions.signUserId || this.userId;
    try {
      this.signature = await this.signaturesService.getUserSignature(this.signatureUserId);
    } catch {
      this.signatureError = true;
    } finally {
      this.loadingSignature = false;
    }
  }

  protected async sign() {
    this.loadingSubmit = true;
    const document = await firstValueFrom(
      this.documentsService.signDocument(this.signOptions.paperId, this.signOptions.requiredDocument.name)
    );
    if(document) {
      const content = await firstValueFrom(this.documentsService.getDocument(document.id));
      if(content) {
        this.dialogRef.close({ document, content });
        this.snackBar.open('Documentul a fost semnat.');
      }
    }
    this.loadingSubmit = false;
  }

  openSampleEditor() {
    this.dialog.open(this.createSampleTemplate, {
      autoFocus: null
    });
  }

  async saveSample(blobPromise: Promise<Blob>) {
    const blob = await blobPromise;
    const file = new File([blob], 'sample.png');
    this.loadingSignature = true;
    try {
      this.signature = await this.signaturesService.createOrUpdateUserSignature(file);
      this.signature.sample = await fileToBase64(file)
    } catch(err) {
      this.signatureError = true;
    } finally {
      this.loadingSignature = false;
    }
  }

}
