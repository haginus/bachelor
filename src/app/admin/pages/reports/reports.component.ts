import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ReportFile, ReportsService } from '../../../services/reports.service';
import { FileGenerationStatus } from '../../../lib/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilesService } from '../../../services/files.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: false
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
    const previousStatus = { ...this.finalReportStatus };
    this.finalReportStatus = {
      ...previousStatus,
      status: 'in_progress',
      progress: 0,
    };
    await firstValueFrom(this.reportsService.generateFinalReport()).catch(() => {
      this.finalReportStatus = previousStatus;
    });
  }

  async getFinalReport() {
    const document = await firstValueFrom(this.reportsService.getFinalReport());
    this.filesService.saveFile(document);
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
