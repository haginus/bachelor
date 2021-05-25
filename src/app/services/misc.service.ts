import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  constructor(private http: HttpClient) { }

  getFAQ(faqName: string): Observable<FAQ[]> {
    const url = `/assets/faq/${faqName}.json`;
    return this.http
      .get<FAQ[]>(url)
      .pipe(
        catchError(this.handleError<any>('getFAQ', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}

export interface FAQ {
  question: string;
  answer: string;
}
