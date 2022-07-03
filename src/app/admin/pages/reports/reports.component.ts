import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/services/admin.service';
import { DocumentService } from 'src/app/services/document.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  constructor(private document: DocumentService, private admin: AdminService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
  }

  getFinalCatalog(mode: string) {
    let sbRef = this.snackbar.open('Se generează documentul...', null, { duration: null });
    this.admin.getFinalCatalog(mode).subscribe(data => {
      if(!data) return;
      this.document.viewDocument(data, 'application/pdf');
      sbRef.dismiss();
    });
  }

  getFinalReport() {
    let sbRef = this.snackbar.open('Se generează raportul... Acest lucru poate dura ceva.', null, { duration: null });
    this.admin.getFinalReport().subscribe(buffer => {
      if(buffer) {
        this.document.downloadDocument(buffer, 'Raport final.zip', 'application/zip');
      }
      sbRef.dismiss();
    });
  }

}
