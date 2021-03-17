import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService, Domain } from './auth.service';
import { OfferApplication } from './student.service';
import { Topic } from './topics.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  constructor(private http: HttpClient, private auth: AuthService) { }

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

  addOffer(domainId: number, topicIds: number[], limit: number): Observable<Offer> {
    const url = `${environment.apiUrl}/teacher/offers/add`;
    const data = { domainId, topicIds, limit };
    return this.http
      .post<Offer>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Offer>('addOffer', null))
      );
  }

  editOffer(id: number, domainId: number, topicIds: number[], limit: number): Observable<Offer> {
    const url = `${environment.apiUrl}/teacher/offers/edit`;
    const data = { id, domainId, topicIds, limit };
    return this.http
      .post<Offer>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<Offer>('editOffer', null))
      );
  }

  getApplications(): Observable<OfferApplication[]> {
    const url = `${environment.apiUrl}/teacher/applications`
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}

export interface Offer {
  id: number
  takenPlaces: number
  limit: number
  topics: Topic[]
  domainId: number,
  pendingApplications: number
  domain: Domain
}
