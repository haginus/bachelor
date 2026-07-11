import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer } from '@angular/platform-browser';
import { UploadFileDirective } from '../../directives/upload-file.directive';
import { ImportSpecification } from '../../../lib/types';

@Component({
  selector: 'app-import-dialog-content',
  imports: [
    MatDialogModule,
    MatIcon,
    MatButtonModule,
    MatProgressSpinner,
    UploadFileDirective
  ],
  templateUrl: './import-dialog-content.component.html',
  styleUrl: './import-dialog-content.component.scss',
})
export class ImportDialogContentComponent {

  public readonly specification = signal<ImportSpecification | null>(null);
  public readonly title = input.required<string>();
  public readonly description = input<string>();
  public readonly onFilePicked = output<File>();
  public readonly canUpload = input<boolean>(true);

  private readonly sanitizer = inject(DomSanitizer);

  public isSubmitting = signal(false);

  protected exampleFileUrl = computed(() => {
    const specification = this.specification();
    if (!specification || !specification.exampleFile) {
      return null;
    }

    const exampleFile = specification.exampleFile;
    if (exampleFile.encoding === 'base64') {
      return this.sanitizer.bypassSecurityTrustUrl(
        `data:${exampleFile.mimeType};base64,${exampleFile.content}`
      );
    }

    return this.sanitizer.bypassSecurityTrustUrl(
      `data:${exampleFile.mimeType};charset=utf-8,${encodeURIComponent(exampleFile.content)}`
    );
  });

  protected formatValue(value: unknown): string {
    if (value === null) {
      return 'null';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return JSON.stringify(value);
  }

  async handlePick(file: File) {
    if(!file) return;
    this.onFilePicked.emit(file);
  }

}
