import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, catchError, firstValueFrom, map, of } from "rxjs";
import { environment } from "../../environments/environment";
import { DocumentReuploadRequest, Paginated, Paper, PaperType } from "../lib/types";
import { removeEmptyProperties } from "../lib/utils";
import { FilesService } from "./files.service";

@Injectable({
  providedIn: 'any'
})
export class PapersService {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private filesService: FilesService,
    private snackbar: MatSnackBar
  ) {}

  private readonly apiUrl = `${environment.apiUrl}/papers`;

  findAll(params: PaperQueryDto): Observable<Paginated<Paper>> {
    return this.http.get<Paginated<Paper>>(this.apiUrl, { params: removeEmptyProperties(params) });
  }

  findMineStudent() {
    return this.http.get<Paper>(`${this.apiUrl}/me`);
  }

  findMineTeacher() {
    return this.http.get<Paper[]>(`${this.apiUrl}/me`);
  }

  getXlsxExport(params?: { onlySubmitted?: boolean; teacherId?: number; }) {
    return this.filesService.getFile(`${this.apiUrl}/export/xlsx`, removeEmptyProperties(params));
  }

  async saveXlsxExport(params?: { onlySubmitted?: boolean; teacherId?: number; }) {
    const buffer = await firstValueFrom(this.getXlsxExport(params));
    this.filesService.saveFile(buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Lucrări.xlsx');
  }

  create(paper: CreatePaperDto) {
    return this.http.post<Paper>(this.apiUrl, paper);
  }

  update(paperId: number, paper: UpdatePaperDto) {
    const url = `${this.apiUrl}/${paperId}`;
    return this.http.put<{ result: Paper; documentsGenerated: boolean; }>(url, paper);
  }

  validate(paperId: number, validationDto: ValidatePaperDto) {
    return this.http.post<Paper>(`${this.apiUrl}/${paperId}/validate`, validationDto);
  }

  undoValidation(paperId: number) {
    const url = `${this.apiUrl}/${paperId}/undo-validation`;
    return this.http.post<Paper>(url, {});
  }

  delete(paperId: number) {
    return this.http.delete<void>(`${this.apiUrl}/${paperId}`);
  }

}

export interface PaperQueryDto {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  submitted?: boolean;
  assigned?: boolean;
  /** ID of committee where the paper has been assigned */
  assignedTo?: number;
  /** ID of committee that can take the papers for grading. */
  forCommittee?: number;
  validity?: 'valid' | 'invalid' | 'not_validated' | 'not_invalid';
  title?: string;
  type?: PaperType;
  domainId?: number;
  specializationId?: number;
  studentName?: string;
  minified?: boolean;
}

type UpdatePaperDto = {
  title: string;
  description: string;
  topicIds: number[];
}

type CreatePaperDto = UpdatePaperDto & {
  studentId: number;
  teacherId: number;
}

type ValidatePaperDto = {
  isValid: boolean;
  generalAverage?: number;
  ignoreRequiredDocuments?: boolean;
}
