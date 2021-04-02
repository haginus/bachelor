import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Committee } from '../admin/pages/committees/committees.component';
import { AuthService, Domain, SessionSettings, UserData } from './auth.service';
import { Topic } from './topics.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private auth: AuthService, private snackbar: MatSnackBar) { }

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
    group: string, specializationId: number, identificationCode: string, promotion: string,
    studyForm: string, fundingForm: string, matriculationYear: string): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/students/add`;
    const body = { firstName, lastName, CNP, email, group, specializationId, identificationCode, promotion,
      studyForm, fundingForm, matriculationYear };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addStudent", null))
    );
  }

  editStudent(id: number, firstName: string, lastName: string, CNP: string,
    group: string, specializationId: number, identificationCode: string, promotion: string,
    studyForm: string, fundingForm: string, matriculationYear: string): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/students/edit`;
    const body = { id, firstName, lastName, CNP, group, specializationId, identificationCode, promotion,
      studyForm, fundingForm, matriculationYear };
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

  getDomains(extraDetails?: boolean): Observable<Domain[]> {
    let url = `${environment.apiUrl}/admin/domains`;
    if(extraDetails) url += `/extra`;
    return this.http
      .get<Domain[]>(url, this.auth.getPrivateHeaders(),)
      .pipe(
        retry(3),
        catchError(this.handleError<Domain[]>('getDomains', []))
      );
  }

  addDomain(domain: Domain): Observable<Domain> {
    const url = `${environment.apiUrl}/admin/domains/add`;
    return this.http.post<Domain>(url, domain, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<Domain>('addDomain', null))
    );
  }

  editDomain(domain: Domain): Observable<Domain> {
    const url = `${environment.apiUrl}/admin/domains/edit`;
    return this.http.post<Domain>(url, domain, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<Domain>('editDomain', null))
    );
  }

  deleteDomain(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/domains/delete`;
    return this.http.post<any>(url, { id }, this.auth.getPrivateHeaders()).pipe(
      map(res => {
        return true;
      }),
      catchError(this.handleError<boolean>('editDomain', false))
    );
  }

  // Topics

  getTopics(sort: string = 'id', order: string = 'ASC', page: number = 0, pageSize: number = 10):
    Observable<TopicQueryResult> {
    const url = `${environment.apiUrl}/admin/topics?sort=${sort}&order=${order}&page=${page}&pageSize=${pageSize}`;
    return this.http
      .get<TopicQueryResult>(url, this.auth.getPrivateHeaders(),)
      .pipe(
        retry(3),
        catchError(this.handleError<TopicQueryResult>('getTopics', { rows: [], count: 0 }))
      );
  }

  addTopic(name: string): Observable<Topic> {
    const url = `${environment.apiUrl}/admin/topics/add`;
    return this.http.post<Topic>(url, { name }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<Topic>('addTopic', null))
    );
  }

  editTopic(id: number, name: string): Observable<Topic> {
    const url = `${environment.apiUrl}/admin/topics/edit`;
    return this.http.post<any>(url, { id, name }, this.auth.getPrivateHeaders()).pipe(
      map(res => {
        return { id, name } as Topic
      }),
      catchError(this.handleError<Topic>('editTopic', null))
    );
  }

  // Committees

  getCommittees(): Observable<Committee[]> {
    const url = `${environment.apiUrl}/admin/committees`;
    return this.http.get<Committee[]>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<Committee[]>('getCommittees', []))
    );
  }

  // Session Settings 

  changeSessionSettings(settings: SessionSettings): Observable<SessionSettings> {
    const url = `${environment.apiUrl}/admin/session`;
    return this.http.post<any>(url, settings, this.auth.getPrivateHeaders()).pipe(
      map(_ => {
        // Update the session settings in the state of the app
        this.auth.sessionSettingsSource.next(settings);
        return settings;
      }),
      catchError(this.handleError<SessionSettings>('changeSessionSettings', null))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open("A apărut o eroare.");
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

export interface TopicQueryResult {
  rows: Topic[],
  count: number
}
