import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Topic } from './topics.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private http: HttpClient, private auth: AuthService) { }

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

export interface GetTeacherOffersFilters {
  onlyFree: boolean,
  teacherName: string | null,
  topicIds: number[] | null
}