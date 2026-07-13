import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImportSpecificationProperty, ImportValidationErrorDetail } from '../../../lib/types';
import { getProperty } from '../../../lib/utils';

@Component({
  selector: 'app-import-errors-dialog',
  templateUrl: './import-errors-dialog.component.html',
  styleUrls: ['./import-errors-dialog.component.scss'],
  standalone: false
})
export class ImportErrorsDialogComponent {

  public readonly data: ImportErrorsDialogData = inject(MAT_DIALOG_DATA);

  private errorsByRowAndProperty = this.data.details.reduce((acc, detail) => {
    detail.validationErrors.forEach(error => {
      const key = this.getRowPropertyKey(detail.rowIndex, error.property);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(...error.messages);
    });
    return acc;
  }, {} as Record<`${number}-${string}`, string[]>);

  private getRowPropertyKey(rowIndex: number, propertyPath: string): `${number}-${string}` {
    return `${rowIndex}-${propertyPath}`;
  }

  protected getRowPropertyErrors(rowIndex: number, propertyPath: string): string[] {
    const key = this.getRowPropertyKey(rowIndex, propertyPath);
    return this.errorsByRowAndProperty[key] || [];
  }

  protected getProperty = getProperty;

}

export interface ImportErrorsDialogData {
  details: ImportValidationErrorDetail[];
  properties: ImportSpecificationProperty[];
}
