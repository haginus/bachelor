import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService } from '../../../services/document.service';
import { AdminService, FinalReportStatus } from '../../../services/admin.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ReportFile, ReportFilesFormat, ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  constructor(
    private reportsService: ReportsService,
    private admin: AdminService,
  ) {}

  finalReportStatus: FinalReportStatus;

  ngOnInit(): void {
    this.getFinalReportStatus();
  }

  async openReportFile(fileName: ReportFile) {
    return this.reportsService.openFile(fileName);
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
