import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImportResult, ImportSpecificationProperty } from '../../../lib/types';
import { getProperty } from '../../../lib/utils';

@Component({
  selector: 'app-import-result-dialog',
  templateUrl: './import-result-dialog.component.html',
  styleUrls: ['./import-result-dialog.component.scss'],
  standalone: false
})
export class ImportResultDialogComponent {

  public readonly data: ImportResultDialogData = inject(MAT_DIALOG_DATA);

  protected getProperty = getProperty;

}

export interface ImportResultDialogData {
  result: ImportResult;
  properties: ImportSpecificationProperty[];
}
