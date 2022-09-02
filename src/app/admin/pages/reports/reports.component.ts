import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService, FinalReportStatus } from 'src/app/services/admin.service';
import { DocumentService } from 'src/app/services/document.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  constructor(private document: DocumentService, private admin: AdminService, private snackbar: MatSnackBar) { }

  finalReportStatus: FinalReportStatus; 

  ngOnInit(): void {
    this.getFinalReportStatus();
  }

  getFinalCatalog(mode: string) {
    let sbRef = this.snackbar.open('Se generează documentul...', null, { duration: null });
    this.admin.getFinalCatalog(mode).subscribe(data => {
      if(!data) return;
      this.document.viewDocument(data, 'application/pdf');
      sbRef.dismiss();
    });
  }

  getReportFile(reportName: any, download = false) {
    this.admin.getReportFile(reportName).subscribe(data => {
      if(!data) return;
      const { report, buffer } = data;
      if(download) {
        this.document.downloadDocument(buffer, report.name, report.mimeType);
      } else {
        this.document.viewDocument(buffer, report.mimeType);
      }
    });
  }

  getFinalReportStatus() {
    this.admin.getFinalReportStatus().subscribe(status => {
      this.finalReportStatus = status;
    })
  }

  generateFinalReport() {
    this.finalReportStatus.isGenerating = true;
    let sbRef = this.snackbar.open('Se generează raportul... Acest lucru poate dura ceva.', null, { duration: null });
    this.admin.generateFinalReport().subscribe(_ => {
      this.getFinalReportStatus();
      sbRef.dismiss();
    });
  }

  getFinalReport() {
    this.admin.getFinalReportLink().subscribe(link => {
      if(link) {
        window.open(link, "_blank");
      }
    });
  }

  get lastGeneratedOn() {
    return new Date(this.finalReportStatus?.lastGeneratedOn).toLocaleDateString("ro", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

}
