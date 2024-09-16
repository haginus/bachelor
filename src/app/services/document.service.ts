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

  uploadDocument(paperId: number, perspective: 'student' | 'teacher' | 'committee' | 'admin',
    file: File, name: string, type: string): Observable<PaperDocument> {

    const perspectivePath = perspective == 'committee' ? 'teacher' : perspective;

    const url = `${environment.apiUrl}/${perspectivePath}/papers/documents/upload`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('paperId', String(paperId));
    formData.append('perspective', perspective);
    return this.http.post<PaperDocument>(url, formData, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("uploadDocument", null))
    );
  }

  signDocument(paperId: number, name: string) {
    const url = `${environment.apiUrl}/student/paper/documents/sign`;
    return this.http.post<PaperDocument>(url, { name }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("signDocument", null))
    );
  }

  getDocument(id: number): Observable<ArrayBuffer> {
    const url = `${environment.apiUrl}/documents/view?id=${id}`;
    const options = this.auth.getPrivateHeaders();
    options.headers.append('Cache-Control', 'no-store');
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<any>('getDocument', null))
      );
  }

  deleteDocument(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/documents/delete`;
    return this.http
      .post<any>(url, { id }, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<any>('deleteDocument', false))
      );
  }

  getCommitteeDocument(committeeId: number, documentName: CommitteeDocument) {
    const url = `${environment.apiUrl}/documents/committee/${documentName}?committeeId=${committeeId}`;
    const options = this.auth.getPrivateHeaders();
    options.headers.append('Cache-Control', 'no-store');
    return this.http
      .get<ArrayBuffer>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<ArrayBuffer>('getCommitteeDocument', null))
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

export type CommitteeDocument = 'catalog' | 'catalog_docx' | 'final_catalog';
export const CommitteeDocumentsFormat: Record<CommitteeDocument, [string, string]> = {
  'catalog': ['application/pdf', 'Catalog'],
  'catalog_docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Catalog'],
  'final_catalog': ['application/pdf', 'Catalog final'],
}
