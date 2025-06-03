import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { AuthService, Domain, Paper, PaperDocument, UserData, UserDataMin } from './auth.service';
import { Topic } from './topics.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'any'
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

  applyToOffer(offerId: number, application: OfferApplication): Observable<PostResponse> {
    const url = `${environment.apiUrl}/student/teacher-offers/apply`;
    return this.http.post(url, { offerId, ...application }, this.auth.getPrivateHeaders()).pipe(
      map(res => {
        return { success: true } as PostResponse
      }),
      catchError(this.handleError<PostResponse>('applyToOffer', { error: ''}))
    );
  }

  getApplications(state: 'accepted' | 'declined' | 'pending' = null):
  Observable<OfferApplication[]> {
    let url = `${environment.apiUrl}/student/applications`;
    if(state) {
      url += `?state=${state}`;
    }
    return this.http
      .get<OfferApplication[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<OfferApplication[]>('getApplications', []))
      );
  }

  cancelApplication(id: number): Observable<boolean> {
    const url = `${environment.apiUrl}/student/applications/cancel`;
    const data = { applicationId: id };
    return this.http
      .post<any>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('cancelApplication', null))
      );
  }

  getPaper(): Observable<Paper> {
    const url = `${environment.apiUrl}/student/paper`
    return this.http
      .get<Paper>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<Paper>('getPaper', null))
      );
  }

  getExtraData(): Observable<StudentExtraData> {
    const url = `${environment.apiUrl}/student/extra-data`
    return this.http
      .get<StudentExtraData>(url, this.auth.getPrivateHeaders())
      .pipe(
        retry(3),
        catchError(this.handleError<StudentExtraData>('getExtraData', null))
      );
  }

  setExtraData(data: StudentExtraData): Observable<boolean> {
    const url = `${environment.apiUrl}/student/extra-data/set`
    return this.http
      .post<any>(url, data, this.auth.getPrivateHeaders())
      .pipe(
        map(_ => true),
        catchError(this.handleError<boolean>('setExtraData', false))
      );
  }

  getPaperRequiredDocuments(): Observable<PaperRequiredDocument[]> {
    const url = `${environment.apiUrl}/student/paper/documents/get-required`;
    return this.http
      .get<PaperRequiredDocument[]>(url, this.auth.getPrivateHeaders())
      .pipe(
        catchError(this.handleError<PaperRequiredDocument[]>('getPaperRequiredDocuments', []))
      );
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open(error?.error.message || 'A apărut o eroare.');
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
  hasApplied?: boolean
  pendingApplications?: number;
  limit: number
  topics: Topic[]
  domainId: number,
  domain?: Domain,
  teacher?: UserDataMin,
  description: string,
}

export interface OfferApplication {
  id?: number,
  title: string,
  description: string,
  usedTechnologies?: string,
  accepted?: null | boolean,
  offer?: Offer,
  student?: UserDataMin
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

export interface PaperDocumentTypes {
  generated?: boolean,
  signed?: boolean,
  copy?: boolean
}

export type PaperDocumentUploadBy = 'student' | 'teacher' | 'committee';
export type PaperDocumentCategory = 'secretary_files' | 'paper_files';

export interface PaperRequiredDocument {
  title: string,
  name: string,
  category: PaperDocumentCategory,
  types: PaperDocumentTypes,
  acceptedMimeTypes: string,
  acceptedExtensions: string[],
  uploadBy: PaperDocumentUploadBy;
  uploadInstructions?: string;
}

export interface StudentExtraData {
  birthLastName: string,
  parentInitial: string,
  fatherName: string,
  motherName: string,
  civilState: 'not_married' | 'married' | 'divorced' | 'widow' | 're_married',
  dateOfBirth: Date | any,
  citizenship: string,
  ethnicity: string,
  placeOfBirthCountry: string,
  placeOfBirthCounty: string,
  placeOfBirthLocality: string,
  landline: string,
  mobilePhone: string,
  personalEmail: string,
  address: UserAddress;
}

export interface UserAddress {
  county: string,
  locality: string,
  street: string,
  streetNumber: string,
  building?: string,
  stair?: string,
  floor?: string,
  apartment?: string,
}
