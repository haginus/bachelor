import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService, Domain, Paper, SessionSettings, UserData, Committee, CommitteeMember } from './auth.service';
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

  getStudentUser(id: number): Observable<UserData> {
    const url = `${environment.apiUrl}/admin/student?id=${id}`;
    return this.http
      .get<UserData>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<UserData>('getStudentUser', null))
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

  addTeacher(title: string, firstName: string, lastName: string, CNP: string, email: string): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/teachers/add`;
    const body = { title, firstName, lastName, CNP, email };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addTeacher", null))
    );
  }

  editTeacher(id: number, title: string, firstName: string, lastName: string, CNP: string): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/teachers/edit`;
    const body = { id, title, firstName, lastName, CNP };
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

  getCommittee(id: number): Observable<Committee> {
    const url = `${environment.apiUrl}/admin/committees/${id}`;
    return this.http.get<Committee>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<Committee>('getCommittee', null))
    );
  }

  addCommittee(name: string, domains: number[], members: CommitteeMember[]): Observable<any> {
    const url = `${environment.apiUrl}/admin/committees/add`;
    return this.http.post<any>(url, { name, domains, members }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<any>('addCommittee', null))
    );
  }

  editCommittee(id: number, name: string, domains: number[], members: CommitteeMember[]): Observable<any> {
    const url = `${environment.apiUrl}/admin/committees/edit`;
    return this.http.post<any>(url, { id, name, domains, members }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<any>('editCommittee', null))
    );
  }

  deleteCommittee(id: number): Observable<any> {
    const url = `${environment.apiUrl}/admin/committees/delete`;
    return this.http.post<any>(url, { id }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<any>('deleteCommittee', null))
    );
  }

  setCommitteePapers(id: number, paperIds: number[]): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/committees/assign-papers`;
    return this.http.post<any>(url, { id, paperIds }, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<any>('setCommitteePapers', false))
    );
  }

  generateCommitteeDocument(documentName: 'committee_compositions') {
    const url = `${environment.apiUrl}/admin/committees/documents/${documentName}`;
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<ArrayBuffer>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<ArrayBuffer>('generateCommitteeDocument', null))
      );
  }

  // Papers 

  getPapers(sort: string = 'id', order: string = 'ASC', page?: number, pageSize?: number,
    filter?: GetPapersFilter, minified?: boolean): Observable<PaperQueryResult> {
    
    let url = `${environment.apiUrl}/admin/papers?sort=${sort}&order=${order}`;
    if(page != undefined && pageSize) {
      url += `&page=${page}&pageSize=${pageSize}`;
    }
    if(filter?.assigned != undefined) {
      url += `&assigned=${filter.assigned}`;
    }
    if(filter?.assignedTo != undefined) {
      url += `&assignedTo=${filter.assignedTo}`;
    }
    if(minified == true) {
      url += `&minified=1`;
    }
    return this.http.get<PaperQueryResult>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<PaperQueryResult>('getPapers', { rows: [], count: 0 }))
    );
  }

  /** Validate/Invalidate a paper by its ID. */
  validatePaper(paperId: number, validate: boolean): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/papers/validate`;
    return this.http.post<any>(url, { paperId, validate }, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<boolean>('getPapers', false))
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

export interface GetPapersFilter {
  /** If paper is assigned to any committee */
  assigned?: boolean;
  /** ID of committee where the paper has been assigned */
  assignedTo?: number
}

export interface PaperQueryResult {
  rows: Paper[],
  count: number
}
