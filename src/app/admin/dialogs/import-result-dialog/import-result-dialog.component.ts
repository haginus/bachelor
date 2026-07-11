import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImportResult, ImportSpecificationProperty } from '../../../lib/types';

@Component({
  selector: 'app-import-result-dialog',
  templateUrl: './import-result-dialog.component.html',
  styleUrls: ['./import-result-dialog.component.scss'],
  standalone: false
})
export class ImportResultDialogComponent {

  protected readonly data: ImportResultDialogData = inject(MAT_DIALOG_DATA);

  protected getProperty(object: any, propertyPath: string): any {
    const properties = propertyPath.split('.');
    let currentObject = object;
    for (const property of properties) {
      if (currentObject && typeof currentObject === 'object' && property in currentObject) {
        currentObject = currentObject[property];
      } else {
        return undefined;
      }
    }
    return currentObject;
  }

}

export interface ImportResultDialogData {
  result: ImportResult;
  properties: ImportSpecificationProperty[];
}
