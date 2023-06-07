import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService, Committee, Domain, Paper, PaperDocument, UserData } from './auth.service';
import { EditPaperResponse, OfferApplication } from './student.service';
import { Topic } from './topics.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(private http: HttpClient, private auth: AuthService, private snackbar: MatSnackBar) { }

  getDomains(): Observable<Domain[]> {
    const url = `${environment.apiUrl}/teacher/domains`;
    return this.http
      .get<Domain[]>(url, this.auth.getPrivateHeaders(),)
      .pipe(
        retry(3),
        catchError(this.handleError<Domain[]>('getDomains', []))
      );
  }

  getOffers(): Observable<Offer[]> {
    const url = `${environment.apiUrl}/teacher/offers`
    return this.http
      .get<Offer[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<Offer[]>('getOffers', []))
      );
  }

  addOffer(domainId: number, topicIds: number[], limit: number, description: string): Observable<Offer> {
    const url = `${environment.apiUrl}/teacher/offers/add`;
    const data = { domainId, topicIds, limit, description };
    return this.http
      .post<Offer>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Offer>('addOffer', null))
      );
  }

  editOffer(id: number, domainId: number, topicIds: number[], limit: number, description: string): Observable<Offer> {
    const url = `${environment.apiUrl}/teacher/offers/edit`;
    const data = { id, domainId, topicIds, limit, description };
    return this.http
      .post<Offer>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Offer>('editOffer', null))
      );
  }

  deleteOffer(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/teacher/offers/delete`;
    return this.http.post<any>(url, { id }, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('deleteOffer', false))
      );
  }

  getApplications(offerId: number = null, state: 'accepted' | 'declined' | 'pending' = null):
  Observable<OfferApplication[]> {
    let url = `${environment.apiUrl}/teacher/applications?`;
    if(offerId) {
      url += `offerId=${offerId}&`;
    }
    if(state) {
      url += `state=${state}`;
    }
    return this.http
      .get<OfferApplication[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<OfferApplication[]>('getApplications', []))
      );
  }

  declineApplication(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/teacher/applications/decline`;
    const data = { applicationId: id };
    return this.http
      .post<any>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('declineApplication', null))
      );
  }

  acceptApplication(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/teacher/applications/accept`;
    const data = { applicationId: id };
    return this.http
      .post<any>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('acceptApplication', null))
      );
  }

  // Student Papers

  getStudentPapers(): Observable<Paper[]> {
    const url = `${environment.apiUrl}/teacher/papers`
    return this.http
      .get<Paper[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<Paper[]>('getStudentPapers', []))
      );
  }

  getStudentPapersExcel(): Observable<ArrayBuffer> {
    const url = `${environment.apiUrl}/teacher/papers/excel`;
    const options = this.auth.getPrivateHeaders();
    return this.http
      .get<any>(url, {...options, responseType: 'arraybuffer' as 'json'})
      .pipe(
        catchError(this.handleError<any>('getStudentPapersExcel', null))
      );
  }

  addPaper(studentId: number, title: string, description: string, topicIds: number[]): Observable<Paper> {
    const url = `${environment.apiUrl}/teacher/papers/add`;
    const data = { studentId, title, description, topicIds };
    return this.http.post<Paper>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Paper>('addPaper', null))
      )
  }

  editPaper(paperId: number, title: string, description: string, topicIds: number[]): Observable<EditPaperResponse> {
    const url = `${environment.apiUrl}/teacher/papers/edit`
    return this.http
      .post<EditPaperResponse>(url, { paperId, title, description, topicIds }, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<EditPaperResponse>('editPaper', { success: false }))
      );
  }

  getStudents(firstName?: string, lastName?: string, email?: string, domainId?: number): Observable<UserData[]> {
    let url = `${environment.apiUrl}/teacher/students?`;
    if(firstName) {
      url += `&firstName=${name}`;
    }
    if(lastName) {
      url += `&lastName=${lastName}`;
    }
    if(email) {
      url += `&email=${email}`;
    }
    if(domainId) {
      url += `&domainId=${domainId}`;
    }
    return this.http
      .get<UserData[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<UserData[]>('getStudents', []))
      );
  }

  uploadDocument(paperId: number, perspective: 'teacher' | 'committee',
    file: File, name: string, type: string): Observable<PaperDocument> {

    const url = `${environment.apiUrl}/teacher/papers/documents/upload`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('paperId', String(paperId));
    formData.append('perspective', perspective);
    return this.http.post<PaperDocument>(url, formData, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError("uploadDocument", null))
    );
  }

  removePaper(paperId: number): Observable<boolean> {
    const url = `${environment.apiUrl}/teacher/papers/remove`;
    const data = { paperId };
    return this.http
      .post<any>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('removePaper', false))
      );
  }

  unsubmitPaper(paperId: number) {
    const url = `${environment.apiUrl}/teacher/papers/unsubmit`;
    const data = { paperId };
    return this.http
      .post<any>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('unsubmitPaper', false))
      );
  }

  gradePaper(paperId: number, forPaper: number, forPresentation: number): Observable<boolean> {
    const url = `${environment.apiUrl}/teacher/papers/grade`;
    const data = { paperId, forPaper, forPresentation };
    return this.http
      .post<any>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('gradePaper', false))
      );
  }

  getCommittees(): Observable<Committee[]> {
    const url = `${environment.apiUrl}/teacher/committees`
    return this.http
      .get<Committee[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<Committee[]>('getCommittees', []))
      );
  }

  getCommittee(id: number): Observable<Committee> {
    const url = `${environment.apiUrl}/teacher/committees/${id}`
    return this.http
      .get<Committee>(url, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Committee>('getCommittee', null))
      );
  }

  markGradesAsFinal(committeeId: number): Observable<boolean> {
    const url = `${environment.apiUrl}/teacher/committees/${committeeId}/mark-grades-final`;
    return this.http
      .post<any>(url, {}, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('markGradesAsFinal', false))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open(error.error?.message || "A apărut o eroare.");
      return of(result as T);
    };
  }
}

export interface Offer {
  id: number
  takenPlaces: number
  limit: number
  topics: Topic[],
  description: string,
  domainId: number,
  pendingApplications: number
  domain: Domain
}
