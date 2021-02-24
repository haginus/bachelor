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

  // Students

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

  addStudentsBulk(file: File): Observable<any> {
    const url = `${environment.apiUrl}/admin/students/add-bulk`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(url, formData, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addStudentsBulk", null))
    );
  }

  // Teachers

  getTeacherUsers(sort: string = 'id', order: string = 'ASC', page: number = 0, pageSize: number = 20):
    Observable<TeacherQueryResult> {
    const url = `${environment.apiUrl}/admin/teachers?sort=${sort}&order=${order}&page=${page}&pageSize=${pageSize}`;
    return this.http
      .get<TeacherQueryResult>(url, this.auth.getPrivateHeaders(),)
      .pipe(
        retry(3),
        catchError(this.handleError<TeacherQueryResult>('getTeacherUsers', { rows: [], count: 0 }))
      );
  }

  addTeacher(firstName: string, lastName: string, CNP: string, email: string): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/teachers/add`;
    const body = { firstName, lastName, CNP, email };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addTeacher", null))
    );
  }

  editTeacher(id: number, firstName: string, lastName: string, CNP: string): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/teachers/edit`;
    const body = { id, firstName, lastName, CNP };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("editTeacher", null))
    );
  }

  addTeachersBulk(file: File): Observable<any> {
    const url = `${environment.apiUrl}/admin/teachers/add-bulk`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(url, formData, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addTeachersBulk", null))
    );
  }


  deleteUser(id: number): Observable<any> {
    const url = `${environment.apiUrl}/admin/users/delete`;
    return this.http.post<any>(url, { id }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("deleteUser", null))
    );
  }

  getDomains():
    Observable<Domain[]> {
    const url = `${environment.apiUrl}/admin/domains`;
    return this.http
      .get<Domain[]>(url, this.auth.getPrivateHeaders(),)
      .pipe(
        retry(3),
        catchError(this.handleError<Domain[]>('getDomains', []))
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

export interface TeacherQueryResult {
  rows: UserData[],
  count: number
}
