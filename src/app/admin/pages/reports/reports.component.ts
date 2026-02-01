import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ReportFile, ReportsService } from '../../../services/reports.service';
import { FileGenerationStatus } from '../../../lib/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilesService } from '../../../services/files.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

  constructor(
    private reportsService: ReportsService,
    private readonly filesService: FilesService,
  ) {
    this.reportsService.getFinalReportStatus().pipe(takeUntilDestroyed()).subscribe(status => {
      this.finalReportStatus = status;
    });

  }

  finalReportStatus: FileGenerationStatus;

  async openReportFile(fileName: ReportFile) {
    return this.reportsService.openFile(fileName);
  }

  async generateFinalReport() {
    await firstValueFrom(this.reportsService.generateFinalReport());
  }

  async getFinalReport() {
    const document = await firstValueFrom(this.reportsService.getFinalReport());
    this.filesService.saveFile(document, 'application/zip', 'Raport final');
  }

  get lastGeneratedOn() {
    return new Date(this.finalReportStatus?.lastGeneratedAt).toLocaleDateString("ro", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

}
