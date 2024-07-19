import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService } from '../../../services/document.service';
import { AdminService, FinalReportStatus } from '../../../services/admin.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  constructor(
    private document: DocumentService,
    private admin: AdminService,
    private snackbar: MatSnackBar,
    private auth: AuthService,
  ) { }

  finalReportStatus: FinalReportStatus;

  ngOnInit(): void {
    this.getFinalReportStatus();
  }

  async getFinalCatalog(mode: 'final' | 'centralizing', format: 'pdf' | 'docx' = 'pdf') {
    let sbRef = this.snackbar.open('Se generează documentul...', null, { duration: null });
    const data = await firstValueFrom(this.admin.getFinalCatalog(mode, format));
    const mimeTypes: Record<typeof format, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    if(data) {
      const { sessionName } = await firstValueFrom(this.auth.sessionSettings);
      const catalogName = mode == 'final' ? 'Catalog final' : 'Catalog centralizator';
      const documentTitle = `${catalogName} - Sesiunea ${sessionName}`;
      if(format == 'pdf') {
        this.document.viewDocument(data, mimeTypes[format], documentTitle);
      } else {
        this.document.downloadDocument(data, documentTitle, mimeTypes[format]);
      }
      sbRef.dismiss();
    }
  }

  getReportFile(reportName: any, download = false, query?: Record<string, any>) {
    this.admin.getReportFile(reportName, query).subscribe(data => {
      if(!data) return;
      const { report, buffer } = data;
      if(download) {
        this.document.downloadDocument(buffer, report.name, report.mimeType);
      } else {
        this.document.viewDocument(buffer, report.mimeType, report.name);
      }
    });
  }

  getFinalReportStatus() {
    this.admin.getFinalReportStatus().subscribe(status => {
      this.finalReportStatus = status;
    });
  }

  generateFinalReport() {
    this.finalReportStatus.isGenerating = true;
    this.admin.generateFinalReport().subscribe(status => {
      this.finalReportStatus = status;
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
