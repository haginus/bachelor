import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-import-result-dialog',
  templateUrl: './import-result-dialog.component.html',
  styleUrls: ['./import-result-dialog.component.scss']
})
export class ImportResultDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ImportResultDialogData) { }

  ngOnInit(): void {
  }

}

interface ImportResultDialogData {
  stats: {
    totalRows: number;
    addedRows: number;
    editedRows: number;
    invalidRows: number;
  }
  rows: {
    rowIndex: number;
    row: any;
  } & (
    | { status: 'error'; error: string; }
    | { status: 'added' | 'edited'; result: any; }
  )
}
