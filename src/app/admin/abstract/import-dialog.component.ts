import { inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ImportResult } from "../../lib/types";
import { firstValueFrom } from "rxjs";
import { ImportResultDialogComponent } from "../dialogs/import-result-dialog/import-result-dialog.component";

export abstract class ImportDialogComponent {

  protected readonly dialog = inject(MatDialog);
  protected readonly dialogRef: MatDialogRef<any> = inject(MatDialogRef);
  protected readonly snackBar = inject(MatSnackBar);

  handleImportResult(result: ImportResult) {
    const parts = [
      result.summary.created ? `${result.summary.created} create` : null,
      result.summary.updated ? `${result.summary.updated} editate` : null,
      result.summary.failed ? `${result.summary.failed} ignorate` : null
    ].filter(Boolean);
    let message = `Au fost procesate ${result.summary.proccessed} înregistrări, din care: ${parts.join(', ')}.`;
    this.dialogRef.close(true);
    this.dialog.open(ImportResultDialogComponent, { data: result, width: '90vw', maxWidth: '1000px' });
    this.snackBar.open(message, null, { duration: 10000 });
  }
}
