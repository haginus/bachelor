import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Topic } from './topics.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private http: HttpClient, private auth: AuthService, private snackbar: MatSnackBar) { }

  getTeacherOffers(filters: GetTeacherOffersFilters): Observable<TeacherOffers[]> {
    let url = `${environment.apiUrl}/student/teacher-offers?onlyFree=${filters.onlyFree}`
    if(filters.teacherName) {
      url += '&teacherName=' + filters.teacherName;
    }
    if(filters.topicIds) {
      url += '&topicIds=' + filters.topicIds.join(',');
    }
    return this.http
      .get<TeacherOffers[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<TeacherOffers[]>('getTeacherOffers', []))
      );
  }

  getSuggestedTeacherOffers(): Observable<TeacherOffers[]> {
    const url = `${environment.apiUrl}/student/teacher-offers/suggested`
    return this.http
      .get<TeacherOffers[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<TeacherOffers[]>('getSuggestedTeacherOffers', []))
      );
  }

  applyToOffer(offerId, application: OfferApplication): Observable<PostResponse> {
    const url = `${environment.apiUrl}/student/teacher-offers/apply`;
    return this.http.post(url, { offerId, ...application }, this.auth.getPrivateHeaders()).pipe(
      map(res => {
        return { success: true } as PostResponse
      }),
      catchError(err => {
        let error = (err as any).error as string
        return of({ error })
      })
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}

export interface TeacherOffers {
  id: number
  firstName: string
  lastName: string
  offers: Offer[]
}

export interface Offer {
  id: number
  takenPlaces: number
  hasApplied: boolean
  limit: number
  topics: Topic[]
  domainId: number
}

export interface OfferApplication {
  id?: number,
  title: string,
  description: string,
  usedTechnologies?: string
}

export interface GetTeacherOffersFilters {
  onlyFree: boolean,
  teacherName: string | null,
  topicIds: number[] | null
}

export interface PostResponse {
  success?: boolean,
  error?: string
}