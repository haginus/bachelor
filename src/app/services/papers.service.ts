import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, catchError, map, of } from "rxjs";
import { environment } from "../../environments/environment";
import { DocumentReuploadRequest, Paginated, Paper, PaperType } from "../lib/types";
import { removeEmptyProperties } from "../lib/utils";

@Injectable({
  providedIn: 'any'
})
export class PapersService {

  constructor(private http: HttpClient, private auth: AuthService, private snackbar: MatSnackBar) { }

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

  update(paperId: number, paper: UpdatePaperDto) {
    const url = `${this.apiUrl}/${paperId}`;
    return this.http.put<{ result: Paper; documentsGenerated: boolean; }>(url, paper);
  }

  submitPaper(paperId: number) {
    const url = `${this.apiUrl}/${paperId}/submit`;
    return this.http.post<Paper>(url, {});
  }

  unsubmitPaper(paperId: number) {
    const url = `${this.apiUrl}/${paperId}/unsubmit`;
    return this.http.post<Paper>(url, {});
  }

  validate(paperId: number, validationDto: ValidatePaperDto) {
    return this.http.post<Paper>(`${this.apiUrl}/${paperId}/validate`, validationDto);
  }

  undoValidation(paperId: number) {
    const url = `${this.apiUrl}/${paperId}/undo-validation`;
    return this.http.post<Paper>(url, {});
  }

  getDocumentReuploadRequests(paperId: number) {
    const url = `${this.apiUrl}/${paperId}/reupload-requests`;
    return this.http
      .get<DocumentReuploadRequest[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError('getDocumentReuploadRequests', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open(error?.error.message || 'A apărut o eroare.');
      return of(result as T);
    };
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

type ValidatePaperDto = {
  isValid: boolean;
  generalAverage?: number;
  ignoreRequiredDocuments?: boolean;
}
