import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LoadingComponent } from '../loading/loading.component';
import { PapersService } from '../../../services/papers.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { A11yModule } from "@angular/cdk/a11y";

@Component({
  selector: 'app-paper-documents-archive-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    LoadingComponent,
    MatButtonToggleModule,
    ReactiveFormsModule,
    A11yModule
],
  templateUrl: './paper-documents-archive-dialog.component.html',
  styleUrl: './paper-documents-archive-dialog.component.scss',
})
export class PaperDocumentsArchiveDialogComponent {

  protected readonly data: PaperDocumentsArchiveDialogData | undefined = inject(MAT_DIALOG_DATA);
  private readonly papersService = inject(PapersService);
  private readonly dialogRef = inject(MatDialogRef);
  formGroup = new FormGroup({
    includePaperFilters: new FormControl(this.data?.paperFilters ? true : false),
    documentNames: new FormControl([]),
    groupStrategy: new FormControl<'paper' | 'document_name'>('paper'),
  });
  isDownloading = signal(false);

  async download() {
    this.isDownloading.set(true);
    try {
      const formValue = this.formGroup.getRawValue();
      const paperFilters = formValue.includePaperFilters ? this.data?.paperFilters : undefined;
      const documentNames = formValue.documentNames.length > 0 ? formValue.documentNames : undefined;
      const groupStrategy = formValue.groupStrategy;
      await this.papersService.savePaperDocumentsArchive({ paperFilters, documentNames, groupStrategy });
      this.dialogRef.close();
    } finally {
      this.isDownloading.set(false);
    }
  }
}

export interface PaperDocumentsArchiveDialogData {
  paperFilters: any;
}
