import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private auth: AuthService, private http: HttpClient) { }

  getDocument(id: number): Observable<ArrayBuffer> {
    const url = `${environment.apiUrl}/documents/view?id=${id}`;
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<any>('viewDocument', null))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}
