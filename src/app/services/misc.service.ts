import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, Domain } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'any'
})
export class MiscService {

  constructor(private http: HttpClient, private auth: AuthService, private snackbar: MatSnackBar) { }

  getFAQ(faqName: string): Observable<FAQ[]> {
    const url = `/assets/faq/${faqName}.json`;
    return this.http
      .get<FAQ[]>(url)
      .pipe(
        catchError(this.handleError<any>('getFAQ', []))
      );
  }

  sendProblemReport(report: ProblemReport): Observable<ProblemReport> {
    const url = `${environment.apiUrl}/feedback`;
    return this.http.post<ProblemReport>(url, report, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<ProblemReport>('sendProblemReport', null))
      );
  }

  getDomains(): Observable<Domain[]> {
    let url = `${environment.apiUrl}/domains`;
    return this.http
      .get<Domain[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Domain[]>('getDomains', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open(error?.error.message || 'A apărut o eroare.');
      return of(result as T);
    };
  }
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ProblemReport {
  type: string;
  description: string;
  email: string;
}
