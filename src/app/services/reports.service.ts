import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
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
    private readonly filesService: FilesService,
  ) {}

  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getFile(fileName: ReportFile) {
    return this.filesService.getFileWithProgress(`${this.baseUrl}/files/${fileName}`, { indeterminateTitle: 'Se generează fișierul...' });
  }

  async openFile(fileName: ReportFile) {
    const document = await firstValueFrom(this.getFile(fileName));
    this.filesService.viewOrSaveFile(document);
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

export type ReportFile =
  | 'written_exam_catalog_pdf'
  | 'written_exam_catalog_docx'
  | 'written_exam_after_disputes_catalog_pdf'
  | 'written_exam_after_disputes_catalog_docx'
  | 'final_catalog_pdf'
  | 'final_catalog_docx'
  | 'centralizing_catalog_pdf'
  | 'centralizing_catalog_docx'
  | 'paper_list_xlsx'
  | 'submitted_paper_list_xlsx'
  | 'committee_compositions_pdf'
  | 'student_assignation_pdf'
  | 'student_assignation_xlsx';
