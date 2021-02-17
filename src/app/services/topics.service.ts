import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  getTopics(): Observable<any> {
    const url = `${environment.apiUrl}/topics/`
    return this.http
      .get(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<Topic[]>('getTopics', []))
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
