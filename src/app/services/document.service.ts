import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private auth: AuthService, private http: HttpClient, private snackbar: MatSnackBar) { }

  getDocument(id: number): Observable<ArrayBuffer> {
    const url = `${environment.apiUrl}/documents/view?id=${id}`;
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<any>('viewDocument', null))
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

export type CommitteeDocument = 'catalog' | 'final_catalog';