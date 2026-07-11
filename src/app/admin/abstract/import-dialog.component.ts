import { afterNextRender, Component, inject, viewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ImportResult, ImportSpecification } from "../../lib/types";
import { ImportResultDialogComponent } from "../dialogs/import-result-dialog/import-result-dialog.component";
import { Observable } from "rxjs";
import { ImportDialogContentComponent } from "../../shared/components/import-dialog-content/import-dialog-content.component";

@Component({
  template: '',
})
export abstract class ImportDialogComponent {

  protected readonly dialog = inject(MatDialog);
  protected readonly dialogRef: MatDialogRef<any> = inject(MatDialogRef);
  protected readonly snackBar = inject(MatSnackBar);

  protected abstract specification$: Observable<ImportSpecification>;
  protected abstract uploadFile(file: File): Promise<ImportResult<any, any>>;

  private specification: ImportSpecification | null = null;
  private dialogContentRef = viewChild(ImportDialogContentComponent);

  constructor() {
    afterNextRender(() => {
      const dialogContent = this.dialogContentRef();
      if (!dialogContent) {
        return;
      }
      this.specification$.subscribe(specification => {
        this.specification = specification;
        dialogContent.specification.set(specification);
      });
      dialogContent.onFilePicked.subscribe(async (file: File) => {
        dialogContent.isSubmitting.set(true);
        try {
          const result = await this.uploadFile(file);
          this.handleImportResult(result);
        } finally {
          dialogContent.isSubmitting.set(false);
        }
      });
    });
  }

  private handleImportResult(result: ImportResult) {
    const parts = [
      result.summary.created ? `${result.summary.created} create` : null,
      result.summary.updated ? `${result.summary.updated} editate` : null,
      result.summary.failed ? `${result.summary.failed} ignorate` : null
    ].filter(Boolean);
    let message = `Au fost procesate ${result.summary.processed} înregistrări, din care: ${parts.join(', ')}.`;
    this.dialogRef.close(true);
    this.dialog.open(ImportResultDialogComponent, { data: { result, properties: this.specification.properties }, width: '90vw', maxWidth: '1000px' });
    this.snackBar.open(message, null, { duration: 10000 });
  }
}

@Component({
  imports: [ImportDialogContentComponent],
  template: `
    <app-import-dialog-content
      [title]="data.title"
      [description]="data.description"
    />
  `,
})
export class StandarImportDialogComponent extends ImportDialogComponent {
  protected data = inject<StandarImportDialogData>(MAT_DIALOG_DATA);

  protected override specification$: Observable<ImportSpecification> = this.data.specification$;

  protected override uploadFile(file: File): Promise<ImportResult<any, any>> {
    return this.data.uploadFile(file);
  }
}

export interface StandarImportDialogData {
  title: string;
  description?: string;
  specification$: Observable<ImportSpecification>;
  uploadFile(file: File): Promise<ImportResult<any, any>>;
}

export abstract class ImportDialogComponentV1 {

  protected readonly dialog = inject(MatDialog);
  protected readonly dialogRef: MatDialogRef<any> = inject(MatDialogRef);
  protected readonly snackBar = inject(MatSnackBar);

  handleImportResult(result: ImportResult) {
    const parts = [
      result.summary.created ? `${result.summary.created} create` : null,
      result.summary.updated ? `${result.summary.updated} editate` : null,
      result.summary.failed ? `${result.summary.failed} ignorate` : null
    ].filter(Boolean);
    let message = `Au fost procesate ${result.summary.processed} înregistrări, din care: ${parts.join(', ')}.`;
    this.dialogRef.close(true);
    this.dialog.open(ImportResultDialogComponent, { data: result, width: '90vw', maxWidth: '1000px' });
    this.snackBar.open(message, null, { duration: 10000 });
  }
}
