import { afterNextRender, Component, inject, signal, viewChild } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { ImportResult, ImportSpecification } from "../../lib/types";
import { ImportResultDialogComponent } from "../dialogs/import-result-dialog/import-result-dialog.component";
import { Observable } from "rxjs";
import { ImportDialogContentComponent } from "../../shared/components/import-dialog-content/import-dialog-content.component";
import { ImportErrorsDialogComponent } from "../dialogs/import-errors-dialog/import-errors-dialog.component";

@Component({
  template: '',
})
export abstract class ImportDialogComponent<RowType = any, EntityType = any> {

  protected readonly dialog = inject(MatDialog);
  protected readonly importDialogRef: MatDialogRef<ImportDialogComponent> = inject(MatDialogRef);
  protected readonly snackBar = inject(MatSnackBar);

  protected abstract specification$: Observable<ImportSpecification>;
  protected abstract uploadFile(file: File): Observable<ImportResult<RowType, EntityType>>;

  private resultDialogRef: MatDialogRef<ImportResultDialogComponent> | null = null;
  private successSnackBarRef: MatSnackBarRef<any> | null = null;
  private specification: ImportSpecification | null = null;
  private dialogContentRef = viewChild(ImportDialogContentComponent);

  protected isSubmitting = signal(false);

  constructor() {
    afterNextRender(() => {
      const dialogContent = this.dialogContentRef();
      this.specification$.subscribe(specification => {
        this.specification = specification;
        dialogContent?.specification.set(specification);
      });
      dialogContent?.onFilePicked.subscribe(async (file: File) => {
        this.onFilePicked(file);
      });
    });
  }

  protected onFilePicked(file: File) {
    this.setIsSubmitting(true);
    this.uploadFile(file).subscribe({
      next: (result) => {
        this.handleImportResult(result);
      },
      error: (error) => {
        this.setIsSubmitting(false);
        if(error.error?.code === 'CSV_VALIDATION_ERROR') {
          this.dialog.open(ImportErrorsDialogComponent, {
            data: {
              details: error.error.details || [],
              properties: this.specification?.properties || [],
            },
            width: '90vw',
            maxWidth: '1000px',
            autoFocus: 'dialog',
          });
        }
      },
      complete: () => {
        this.setIsSubmitting(false);
      }
    });
  }

  private handleImportResult(result: ImportResult<RowType, EntityType>) {
    if(!this.resultDialogRef) {
      this.resultDialogRef = this.dialog.open(ImportResultDialogComponent, {
        data: { result, properties: this.specification.properties },
        width: '90vw',
        maxWidth: '1000px',
        disableClose: true,
        autoFocus: 'dialog',
      });
    } else {
      this.resultDialogRef.componentInstance.data.result = result;
    }
    if(result.summary.total === result.summary.processed && !this.successSnackBarRef) {
      this.importDialogRef.close(true);
      this.resultDialogRef.disableClose = false;
      const parts = [
        result.summary.created ? `${result.summary.created} create` : null,
        result.summary.updated ? `${result.summary.updated} editate` : null,
        result.summary.failed ? `${result.summary.failed} ignorate` : null
      ].filter(Boolean);
      let message = `Au fost procesate ${result.summary.processed} înregistrări, dintre care: ${parts.join(', ')}.`;
      this.successSnackBarRef = this.snackBar.open(message, null, { duration: 10000 });
    }
  }

  private setIsSubmitting(isSubmitting: boolean) {
    this.isSubmitting.set(isSubmitting);
    this.dialogContentRef()?.isSubmitting.set(isSubmitting);
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
export class StandardImportDialogComponent extends ImportDialogComponent {
  protected data = inject<StandardImportDialogData>(MAT_DIALOG_DATA);

  protected override specification$: Observable<ImportSpecification> = this.data.specification$;

  protected override uploadFile(file: File): Observable<ImportResult<any, any>> {
    return this.data.uploadFile(file);
  }
}

export interface StandardImportDialogData {
  title: string;
  description?: string;
  specification$: Observable<ImportSpecification>;
  uploadFile(file: File): Observable<ImportResult<any, any>>;
}
