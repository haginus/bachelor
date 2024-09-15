import { Component, TemplateRef, ViewChild } from '@angular/core';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SignaturesService } from '../../../services/signatures.service';
import { Signature } from '../../../lib/types';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { fileToBase64 } from '../../../lib/utils';

@Component({
  selector: 'app-sign-dialog',
  standalone: true,
  imports: [
    SignaturePadComponent,
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
    private readonly signaturesService: SignaturesService,
    private readonly dialog: MatDialog,
  ) {
    this.loadSignature();
  }

  @ViewChild('createSampleTemplate') createSampleTemplate: TemplateRef<any>;
  signature: Signature = null;
  loadingSignature = true;
  signatureError = false;

  private async loadSignature() {
    this.loadingSignature = true;
    try {
      this.signature = await this.signaturesService.getUserSignature();
    } catch {
      this.signatureError = true;
    } finally {
      this.loadingSignature = false;
    }
  }

  protected sign() {

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
