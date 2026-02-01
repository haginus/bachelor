import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { DocumentService } from "./document.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: 'any'
})
export class ReportsService {

  constructor(
    private readonly http: HttpClient,
    private readonly documentsService: DocumentService,
    private readonly snackbar: MatSnackBar,
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
        this.documentsService.viewDocument(document, mimeType, title);
      } else {
        this.documentsService.downloadDocument(document, title, mimeType);
      }
    } finally {
      sbRef.dismiss();
    }
  }

}

export const ReportFilesFormat = {
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
