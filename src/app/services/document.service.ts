import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService, PaperDocument } from './auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DocumentViewerDialogComponent, DocumentViewerDialogData } from '../shared/components/document-viewer-dialog/document-viewer-dialog.component';

@Injectable({
  providedIn: 'any'
})
export class DocumentService {

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  viewDocument(data: ArrayBuffer, type: string, title?: string, signOptions?: DocumentViewerDialogData['signOptions']) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    return this.dialog.open(DocumentViewerDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      data: {
        url,
        type,
        title,
        signOptions,
      },
      autoFocus: 'dialog',
    });
  }

  downloadDocument(buffer: ArrayBuffer, downloadTitle: string, type: string) {
    const blob = new Blob([buffer], { type });
    const url = window.URL.createObjectURL(blob);
    let anchor = document.createElement("a");
    anchor.download = downloadTitle;
    anchor.href = url;
    anchor.click();
  }

  uploadDocument(paperId: number, name: string, type: string, file: File): Observable<PaperDocument> {
    const url = `${environment.apiUrl}/documents/upload`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('paperId', String(paperId));
    return this.http.post<PaperDocument>(url, formData, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("uploadDocument", null))
    );
  }

  signDocument(paperId: number, name: string) {
    const url = `${environment.apiUrl}/documents/sign`;
    return this.http.post<PaperDocument>(url, { name, paperId });
  }

  getDocument(id: number): Observable<ArrayBuffer> {
    const url = `${environment.apiUrl}/documents/${id}/content`;
    const options = this.auth.getPrivateHeaders();
    options.headers.append('Cache-Control', 'no-store');
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<any>('getDocument', null))
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/documents/${id}`);
  }

  getDocumentUploadHistory(paperId: number, name: string): Observable<PaperDocument[]> {
    const url = `${environment.apiUrl}/documents/history?paperId=${paperId}&name=${name}`;
    return this.http.get<PaperDocument[]>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<PaperDocument[]>('getDocumentUploadHistory', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      let msg = 'A apărut o eroare.';
      if(operation == 'deleteDocument') {
        switch(error?.error) {
          case 'NOT_FOUND':
            msg = 'Documentul nu a fost găsit.';
            break;
          case 'UNAUTHORIZED':
            msg = 'Doar cel care a încărcat acest document îl poate șterge.';
            break;
        }
      }
      this.snackbar.open(msg);
      return of(result as T);
    };
  }
}
