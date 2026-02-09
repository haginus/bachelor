import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImportResult } from '../../../lib/types';

@Component({
  selector: 'app-import-result-dialog',
  templateUrl: './import-result-dialog.component.html',
  styleUrls: ['./import-result-dialog.component.scss'],
  standalone: false
})
export class ImportResultDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ImportResult) { }

}
