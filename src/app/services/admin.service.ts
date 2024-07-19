import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, interval, of } from 'rxjs';
import { catchError, first, map, retry, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService, Domain, Paper, SessionSettings, UserData, Committee, CommitteeMember, PaperType, SignUpRequest } from './auth.service';
import { Topic } from './topics.service';
import { StudentExtraData } from './student.service';
import { DocumentReuploadRequest } from '../lib/types';

@Injectable({
  providedIn: 'any'
})
export class AdminService {

  constructor(private http: HttpClient, private auth: AuthService, private snackbar: MatSnackBar, private zone: NgZone) { }

  getStats(): Observable<Statistic[]> {
    const url = `${environment.apiUrl}/admin/stats`;
    return this.http
      .get<Statistic[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<Statistic[]>('getStats', []))
      );
  }

  // Students

  getStudentUsers(sort: string = 'id', order: string = 'ASC', page: number = 0, pageSize: number = 20, filters?: StudentQueryFilters):
    Observable<StudentQueryResult> {
    let url = `${environment.apiUrl}/admin/students?sort=${sort}&order=${order}&page=${page}&pageSize=${pageSize}`;
    if(filters) {
      Object.keys(filters).forEach(filterKey => {
        if(filters[filterKey]) {
          url += `&${filterKey}=${filters[filterKey]}`;
        }
      });
    }
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

  addStudent(data: Omit<EditStudentData, 'id'>): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/students/add`;
    return this.http.post<UserData>(url, data, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addStudent", null))
    );
  }

  editStudent(data: EditStudentData) {
    const url = `${environment.apiUrl}/admin/students/edit`;
    return this.http.post<{ user: UserData, documentsGenerated: boolean }>(url, data, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<null>("editStudent", null))
    );
  }

  editStudentExtraData(id: number, data: StudentExtraData): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/students/${id}/extra-data`;
    return this.http.post<{ success: boolean }>(url, data, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<boolean>('editStudentExtraData', false))
    );
  }

  addStudentsBulk(file: File, specializationId: number, studyForm: string): Observable<any> {
    const url = `${environment.apiUrl}/admin/students/add-bulk`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('specializationId', specializationId.toString());
    formData.append('studyForm', studyForm);
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

  editTeacher(id: number, title: string, firstName: string, lastName: string, CNP: string, email: string): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/teachers/edit`;
    const body = { id, title, firstName, lastName, CNP, email };
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

  // Admins

  addAdmin(firstName: string, lastName: string, email: string, type: 'admin' | 'secretary'): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/admins/add`;
    const body = { firstName, lastName, email, type };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("addAdmin", null))
    );
  }

  editAdmin(id: number, firstName: string, lastName: string, type: 'admin' | 'secretary'): Observable<UserData | null> {
    const url = `${environment.apiUrl}/admin/admins/edit`;
    const body = { id, firstName, lastName, type };
    return this.http.post<UserData>(url, body, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("editAdmin", null))
    );
  }


  deleteUser(id: number): Observable<any> {
    const url = `${environment.apiUrl}/admin/users/delete`;
    return this.http.post<any>(url, { id }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("deleteUser", null))
    );
  }

  resendUserActivationCode(id: number): Observable<any> {
    const url = `${environment.apiUrl}/admin/users/resend-activation-code`;
    return this.http.post<any>(url, { id }, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("resendUserActivationCode", null))
    );
  }

  // Admins

  getAdminUsers(): Observable<UserData[]> {
    const url = `${environment.apiUrl}/admin/admins`;
    return this.http.get<UserData[]>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<UserData[]>('getAdminUsers', []))
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

  deleteTopic(id: number, moveId: number): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/topics/delete`;
    return this.http
      .post<boolean>(url, { id, moveId }, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('deleteTopic', false)
      )
    );
  }

  deleteTopics(ids: number[], moveId: number): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/topics/bulk-delete`;
    return this.http
      .post<boolean>(url, { ids, moveId }, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('deleteTopic', false)
      )
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

  markCommitteeFinalGrades(id: number, finalGrades = true): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/committees/finalGrades`;
    return this.http.post<any>(url, { id, finalGrades }, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<any>('markCommitteeFinalGrades', false))
    );
  }

  setCommitteePapers(id: number, paperIds: number[]): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/committees/assign-papers`;
    return this.http.post<any>(url, { id, paperIds }, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<any>('setCommitteePapers', false))
    );
  }

  autoAssignCommitteePapers(): Observable<AutoAssignCommitteePapersResult> {
    const url = `${environment.apiUrl}/admin/committees/auto-assign-papers`;
    return this.http.post<AutoAssignCommitteePapersResult>(url, {}, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<AutoAssignCommitteePapersResult>('autoAssignCommitteePapers', { success: false }))
    );
  }

  generateCommitteeDocument(documentName: 'committee_compositions' | 'committee_students' | 'committee_students_excel') {
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
    if(filter?.forCommittee != undefined) {
      url += `&forCommittee=${filter.forCommittee}`;
    }
    if(filter?.isValid != undefined) {
      url += `&isValid=${filter.isValid}`;
    }
    if(filter?.isNotValid != undefined) {
      url += `&isNotValid=${filter.isNotValid}`;
    }
    if(filter?.submitted != undefined) {
      url += `&submitted=${filter.submitted}`;
    }
    if(filter?.type != undefined) {
      url += `&type=${filter.type}`;
    }
    if(filter?.domainId != undefined) {
      url += `&domainId=${filter.domainId}`;
    }
    if(filter?.studyForm != undefined) {
      url += `&studyForm=${filter.studyForm}`;
    }
    if(filter?.title != undefined) {
      url += `&title=${filter.title}`;
    }
    if(filter?.studentName != undefined) {
      url += `&studentName=${filter.studentName}`;
    }
    if(minified == true) {
      url += `&minified=1`;
    }
    return this.http.get<PaperQueryResult>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<PaperQueryResult>('getPapers', { rows: [], count: 0 }))
    );
  }

  requestDocumentsReupload(paperId: number, requests: Pick<DocumentReuploadRequest, 'documentName' | 'deadline' | 'comment'>[]) {
    const url = `${environment.apiUrl}/admin/papers/${paperId}/reupload-requests`;
    return this.http.post<DocumentReuploadRequest[]>(url, requests, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<DocumentReuploadRequest[]>('requestDocumentsReupload', []))
    );
  }

  cancelDocumentReuploadRequest(paperId: number, requestId: number) {
    const url = `${environment.apiUrl}/admin/papers/${paperId}/reupload-requests/${requestId}`;
    return this.http.delete<any>(url, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<any>('cancelDocumentReuploadRequest', false))
    );
  }

  /** Validate/Invalidate a paper by its ID. */
  validatePaper(paperId: number, validate: boolean, generalAverage?: number): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/papers/validate`;
    return this.http.post<any>(url, { paperId, validate, generalAverage, ignoreRequiredDocs: true }, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<boolean>('validatePaper', false))
    );
  }

  undoValidatePaper(paperId: number): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/papers/validate/undo`;
    return this.http.post<any>(url, { paperId }, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<boolean>('undoValidatePaper', false))
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

  getFinalReportLink(): Observable<string> {
    const url = `${environment.apiUrl}/admin/session/report/token`;
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<{ token: string }>(url, this.auth.getPrivateHeaders())
      .pipe(
        map(result => `${environment.apiUrl}/admin/session/report/download?token=${result.token}`),
        catchError(this.handleError<any>('getFinalReportLink', null))
      );
  }

  getFinalReportStatus(): Observable<FinalReportStatus> {
    const url = `${environment.apiUrl}/admin/session/report`;
    return interval(1000).pipe(
      startWith(0),
      switchMap(() => this.http.get<FinalReportStatus>(url, this.auth.getPrivateHeaders())),
      takeWhile((status, index) => status.isGenerating, true),
      catchError(this.handleError<any>('getFinalReportStatus', null))
    );
  }

  generateFinalReport(): Observable<FinalReportStatus> {
    const url = this.auth.appendTokenQuery(`${environment.apiUrl}/admin/session/report/generate`);
    const eventSource = new EventSource(url);
    return new Observable<FinalReportStatus>(observer => {
      eventSource.onmessage = event => {
        this.zone.run(() => {
          const data = JSON.parse(event.data) as FinalReportStatus;
          observer.next(data);
          if(data.progress == 1 && data.isGenerating == false) {
            eventSource.close();
            observer.complete();
          }
        });
      }
      eventSource.onerror = event => {
        this.zone.run(() => {
          observer.error(event);
          eventSource.close();
        });
      }
    }).pipe(
      catchError(this.handleError<any>('generateFinalReport', null))
    );
  }

  getFinalCatalog(mode: string, format: 'pdf' | 'docx' = 'pdf'): Observable<ArrayBuffer> {
    const url = `${environment.apiUrl}/documents/final_catalog?mode=${mode}&format=${format}`;
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<any>('getFinalCatalog', null))
      );
  }

  getReportFile<K extends keyof typeof REPORT_FILES>(reportName: K, query?: Record<string, any>): Observable<{ report: ReportFile, buffer: ArrayBuffer }> {
    const report = REPORT_FILES[reportName];
    let url = `${environment.apiUrl}/admin/reports/${reportName}`;
    if(query) {
      url += '?' + Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
    }
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        map(buffer => ({ report, buffer })),
        catchError(this.handleError<any>('getReportFile', null))
      );
  }

  getSignUpRequests(): Observable<SignUpRequest[]> {
    const url = `${environment.apiUrl}/admin/sign-up-requests`;
    return this.http.get<SignUpRequest[]>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError<SignUpRequest[]>('getSignUpRequests', []))
    );
  }

  declineSignUpRequest(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/sign-up-requests/${id}/decline`;
    return this.http.post<any>(url, {}, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<boolean>('declineSignUpRequest', false))
    );
  }

  acceptSignUpRequest(id: number, additionalChanges: SignUpRequest): Observable<boolean> {
    const url = `${environment.apiUrl}/admin/sign-up-requests/${id}/accept`;
    return this.http.post<any>(url, additionalChanges, this.auth.getPrivateHeaders()).pipe(
      map(_ => true),
      catchError(this.handleError<boolean>('declineSignUpRequest', false))
    );
  }

  getSignUpRequestsExcel(): Observable<ArrayBuffer> {
    const url = `${environment.apiUrl}/admin/sign-up-requests/excel`;
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<any>('getSignUpRequestsExcel', null))
      );
  }

  beginNewSession(password: string): Observable<SessionSettings> {
    const url = `${environment.apiUrl}/admin/session/new`;
    return this.http.post<SessionSettings>(url, { password }, this.auth.getPrivateHeaders()).pipe(
      map(settings => {
        // Update the session settings in the state of the app
        this.auth.sessionSettingsSource.next(settings);
        return settings;
      }),
      catchError(this.handleError<SessionSettings>('beginNewSession', null))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open(error.error?.message || "A apărut o eroare.");
      return of(result as T);
    };
  }
}

interface EditStudentData {
  id: number;
  firstName: string;
  lastName: string;
  CNP: string;
  email: string;
  group: string;
  specializationId: number;
  identificationCode: string;
  promotion: string;
  studyForm: string;
  fundingForm: string;
  matriculationYear: string;
}

export interface StudentQueryFilters {
  domainId: number;
  specializationId: number;
  group: number;
  promotion: number;
  email: string;
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
  assignedTo?: number;
  /** ID of committee that can take the papers for grading. */
  forCommittee?: number;
  /** If papers must be valid. */
  isValid?: boolean;
  /** If papers must not be valid. */
  isNotValid?: boolean;
  /** If papers must be submitted. */
  submitted?: boolean;
  /** Paper type */
  type?: PaperType;
  /** Student domain */
  domainId?: number;
  /** Student study form */
  studyForm?: 'if' | 'id' | 'ifr';
  /** Paper title */
  title?: string;
  /** Student name */
  studentName?: string;
}

export interface PaperQueryResult {
  rows: Paper[],
  count: number
}

export interface AutoAssignCommitteePapersResult {
  success: boolean;
  assignedPapers?: number;
  totalPapers?: number;
}

export interface Statistic {
  title: string;
  content: string | number;
  extra?: string;
  sectionPath: string;
}

export interface FinalReportStatus {
  isGenerating: boolean;
  progress: number;
  lastGeneratedOn: number;
  lastReportPath: string;
}

interface ReportFile {
  name: string;
  mimeType: string;
}

const REPORT_FILES = {
  'paper_list': {
    name: 'Lista lucrărilor',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
}
