import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { MatSnackBar } from "@angular/material/snack-bar";
import { firstValueFrom, map, Observable } from "rxjs";
import { SseClient } from "./sse-client";
import { FileGenerationStatus } from "../lib/types";
import { FilesService } from "./files.service";

@Injectable({
  providedIn: 'any'
})
export class ReportsService {

  constructor(
    private readonly http: HttpClient,
    private readonly sseClient: SseClient,
    private readonly snackbar: MatSnackBar,
    private readonly filesService: FilesService,
  ) {}

  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getFile(fileName: ReportFile) {
    return this.http.get<ArrayBuffer>(`${this.baseUrl}/files/${fileName}`, {
      headers: {
        'Cache-Control': 'no-store',
      },
      responseType: 'blob' as 'json',
    });
  }

  async openFile(fileName: ReportFile) {
    let sbRef = this.snackbar.open('Se generează documentul...');
    try {
      const document = await firstValueFrom(this.getFile(fileName));
      const [mimeType, title] = ReportFilesFormat[fileName];
      if(mimeType === 'application/pdf') {
        this.filesService.viewFile(document, mimeType, title);
      } else {
        this.filesService.saveFile(document, mimeType, title);
      }
    } finally {
      sbRef.dismiss();
    }
  }

  getFinalReportStatus(): Observable<FileGenerationStatus> {
    return this.sseClient.get<FileGenerationStatus>(`${this.baseUrl}/final-report`).pipe(
      map(event => event.data)
    );
  }

  generateFinalReport(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/final-report/generate`, {});
  }

  getFinalReport() {
    return this.filesService.getFileWithProgress(`${this.baseUrl}/final-report/download`);
  }

}

export const ReportFilesFormat = {
  'written_exam_catalog_pdf': ['application/pdf', 'Catalog proba scrisă'],
  'written_exam_catalog_docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Catalog proba scrisă'],
  'final_catalog_pdf': ['application/pdf', 'Catalog final'],
  'final_catalog_docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Catalog final'],
  'centralizing_catalog_pdf': ['application/pdf', 'Catalog centralizator'],
  'centralizing_catalog_docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Catalog centralizator'],
  'paper_list_xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Listă lucrări'],
  'submitted_paper_list_xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Listă lucrări înscrise'],
  'committee_compositions_pdf': ['application/pdf', 'Componența comisiilor și planificarea pe săli și zile'],
  'student_assignation_pdf': ['application/pdf', 'Repartizarea studenților pe comisii'],
  'student_assignation_xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Repartizarea studenților pe comisii'],
} as const satisfies Record<string, [string, string]>;

export type ReportFile = keyof typeof ReportFilesFormat;
