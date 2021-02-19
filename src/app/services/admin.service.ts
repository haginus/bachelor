import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService, Domain, UserData } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  getStudentUsers(sort: string = 'id', order: string = 'ASC', page: number = 0, pageSize: number = 20):
    Observable<StudentQueryResult> {
    const url = `${environment.apiUrl}/admin/students?sort=${sort}&order=${order}&page=${page}&pageSize=${pageSize}`;
    return this.http
      .get<StudentQueryResult>(url, this.auth.getPrivateHeaders(),)
      .pipe(
        retry(3),
        catchError(this.handleError<StudentQueryResult>('getStudentUsers', { rows: [], count: 0 }))
      );
  }

  addStudent(firstName: string, lastName: string, CNP: string, email: string,
    group: string, domainId: number): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/students/add`;
    const body = { firstName, lastName, CNP, email, group, domainId };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addStudent", null))
    );
  }

  editStudent(id: number, firstName: string, lastName: string, CNP: string,
    group: string, domainId: number): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/students/edit`;
    const body = { id, firstName, lastName, CNP, group, domainId };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("editStudent", null))
    );
  }

  getDomains():
    Observable<Domain[]> {
    const url = `${environment.apiUrl}/admin/domains`;
    return this.http
      .get<Domain[]>(url, this.auth.getPrivateHeaders(),)
      .pipe(
        retry(3),
        catchError(this.handleError<Domain[]>('getStudentUsers', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}

export interface StudentQueryResult {
  rows: UserData[],
  count: number
}
