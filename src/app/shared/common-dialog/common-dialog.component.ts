import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-common-dialog',
  templateUrl: './common-dialog.component.html',
  styleUrls: ['./common-dialog.component.scss']
})

/** 
 * Dialog component for confiming actions or other light actions 
 */
export class CommonDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: CommonDialogData) { }

  ngOnInit(): void {
  }

}

export interface CommonDialogData {
  title: string,
  content: string,
  actions: 
    {
      name: string,
      value: any
    }[]
}
