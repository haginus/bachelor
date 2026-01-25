import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, catchError, map, of } from "rxjs";
import { environment } from "../../environments/environment";
import { DocumentReuploadRequest, Paper } from "../lib/types";

@Injectable({
  providedIn: 'any'
})
export class PapersService {

  constructor(private http: HttpClient, private auth: AuthService, private snackbar: MatSnackBar) { }

  private readonly apiUrl = `${environment.apiUrl}/papers`;

  findMineStudent() {
    return this.http.get<Paper>(`${this.apiUrl}/me`);
  }

  findMineTeacher() {
    return this.http.get<Paper[]>(`${this.apiUrl}/me`);
  }

  editPaper(paperId: number, paper: UpdatePaperPayload) {
    const url = `${this.apiUrl}/${paperId}`;
    return this.http
      .put<{ success: boolean; documentsGenerated: boolean; }>(url, paper, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError('editPaper', { success: false, documentsGenerated: false }))
      );
  }

  submitPaper(paperId: number) {
    const url = `${this.apiUrl}/${paperId}/submit`;
    return this.http
      .post<{ success: boolean; }>(url, {}, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError('submitPaper', { success: false }))
      );
  }

  unsubmitPaper(paperId: number) {
    const url = `${this.apiUrl}/${paperId}/unsubmit`;
    return this.http
      .post<{ success: boolean; }>(url, {}, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError('unsubmitPaper', { success: false }))
      );
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

type UpdatePaperPayload = {
  title: string;
  description: string;
  topicIds: number[];
}
