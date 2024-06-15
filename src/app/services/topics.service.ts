import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'any'
})
export class TopicsService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  getTopics(): Observable<Topic[]> {
    const url = `${environment.apiUrl}/topics/`
    return this.http
      .get<Topic[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<Topic[]>('getTopics', []))
      );
  }

  addTopics(names: string[]): Observable<Topic[]> {
    const url = `${environment.apiUrl}/topics/add-bulk`
    return this.http
      .post<Topic[]>(url, { names }, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Topic[]>('addTopics', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}

export interface Topic {
  id: number,
  name: string
}
