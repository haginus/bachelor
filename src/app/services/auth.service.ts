import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { inclusiveDate, parseDate } from '../lib/utils';
import { PaperRequiredDocument } from './student.service';
import { Topic } from './topics.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router, private snackbar: MatSnackBar) { 
    if(this.isSignedIn()) {
      this.getUserData().subscribe(res => {
        this.userDataSource.next(res);
      })
    } else {
      this.userDataSource.next(undefined);
    }
    let sub = this.getSessionSettings().subscribe(settings => {
      this.sessionSettingsSource.next(settings);
      sub.unsubscribe();
    })
  }

  private setToken(token : string) {
    return localStorage.setItem('token', token);
  }

  private removeToken() {
    return localStorage.removeItem('token');
  }

  private getToken() : string | null {
    return localStorage.getItem('token');
  }

  isSignedIn() : boolean {
    return this.getToken() != null;
  }

  signInWithEmailAndPassword(email: string, password: string, captcha: string) : Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<AuthResponse>(url, { email, password, captcha }).pipe(
      map(res => {
        this.setToken((res as any).token);
        this.userDataSource.next((res as any).user);
        return res
      }),
      catchError(this.handleAuthError('signInWithEmailAndPassword'))
    );
  }

  signInWithTokenAndChangePassword(token: string, password: string): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/change-password-token`;
    return this.http.post<AuthResponse>(url, { token, password }).pipe(
      map(res => {
        this.setToken((res as any).token);
        this.userDataSource.next((res as any).user);
        return res
      }),
      catchError(this.handleAuthError('signInWithTokenAndChangePassword'))
    );
  }

  impersonateUser(userId: number): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/impersonate`;
    return this.http.post<AuthResponse>(url, { userId }, this.getPrivateHeaders()).pipe(
      map(res => {
        this.setToken((res as any).token);
        this.userDataSource.next((res as any).user);
        return res;
      }),
      catchError(this.handleAuthError('impersonateUser'))
    );
  }

  releaseUser(): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/release`;
    return this.http.post<AuthResponse>(url, {}, this.getPrivateHeaders()).pipe(
      map(res => {
        this.setToken((res as any).token);
        this.userDataSource.next((res as any).user);
        return res;
      }),
      catchError(this.handleAuthError('releaseUser'))
    );
  }

  checkPasswordResetToken(token: string): Observable<{ email: string }> {
    const url = `${environment.apiUrl}/auth/check-password-token`;
    return this.http.post<{ email: string }>(url, { token }).pipe(
      catchError(this.handleError("checkPasswordResetToken", { email: null }))
    );
  }

  signOut() : Observable<boolean> {
    this.removeToken();
    return of(true);
  }

  sendResetPasswordEmail(email: string, captcha: string) {
    const url = `${environment.apiUrl}/auth/reset-password`;
    return this.http.post<boolean>(url, { email, captcha }).pipe(
      catchError(this.handleError('sendResetPasswordEmail', false))
    );
  }

  getPrivateHeaders() {
    let headers = new HttpHeaders();
    const token = this.getToken();
    if(token) {
      headers = headers.append('Authorization', 'Bearer ' + token);
    }
    return {
      headers,
      withCredentials: false,
    };
  }

  userDataSource: ReplaySubject<UserData | undefined> = new ReplaySubject<UserData | undefined>(1);
  userData = this.userDataSource.asObservable();

  getUserData() : Observable<UserData | undefined> {
    const url = `${environment.apiUrl}/auth/user`;
    return this.http.get<UserData>(url, this.getPrivateHeaders()).pipe(
      catchError(this.handleUserError('getUserData'))
    );
  }

  sessionSettingsSource: ReplaySubject<SessionSettings> = new ReplaySubject<SessionSettings>(1);
  sessionSettings = this.sessionSettingsSource.asObservable();

  getSessionSettings(): Observable<SessionSettings> {
    const url = `${environment.apiUrl}/auth/session`;
    return this.http.get<SessionSettingsI>(url).pipe(
      map(settings => new SessionSettings(settings)),
      catchError((err, caught) => { 
        return of(null);
      })
    );
  }

  getPreferredLanguage(): string {
    let language = localStorage.getItem('language');
    if(['ro', 'en'].includes(language)) { // check language is supported
      return language;
    }
    // reset the language
    this.setPreferredLanguage('ro');
    return 'ro';
  }

  setPreferredLanguage(language: string): void {
    localStorage.setItem('language', language);
  }

  validateStudent(topics: Topic[]) : Observable<boolean> {
    const url = `${environment.apiUrl}/student/validate`;
    return this.http.post(url, { topics }, this.getPrivateHeaders()).pipe(
      tap(res => {
        this.userData.pipe(take(1)).subscribe(user => { // change 
          (user as UserData).validated = true;
          this.userDataSource.next(user);
        });
      }),
      map(res => (res as any).success === true),
      catchError((err, caught) => {
        if(err.error == "ALREADY_VALIDATED") {
          return of(true);
        }
        return of(false);
      })
    );
  }

  validateTeacher() : Observable<boolean> {
    const url = `${environment.apiUrl}/teacher/validate`;
    return this.http.post(url, {}, this.getPrivateHeaders()).pipe(
      tap(res => {
        this.userData.pipe(take(1)).subscribe(user => { // change 
          (user as UserData).validated = true;
          this.userDataSource.next(user);
        });
      }),
      map(res => (res as any).success === true),
      catchError((err, caught) => {
        if(err.error == "ALREADY_VALIDATED") {
          return of(true);
        }
        return of(false);
      })
    );
  }

  editProfile(picture: File, bio: string, website: string): Observable<Profile> {
    const url = `${environment.apiUrl}/auth/profile`;
    const formData: FormData = new FormData();
    if(picture) {
      formData.append('picture', picture, picture.name);
    }
    formData.append('bio', bio);
    formData.append('website', website);
    return this.http.patch<Profile>(url, formData, this.getPrivateHeaders()).pipe(
      tap(profile => {
        this.userData.pipe(take(1)).subscribe(user => { // change 
          (user as UserData).profile = profile;
          this.userDataSource.next(user);
        });
      }),
      catchError(this.handleError("editProfile", null))
    );
  }

  private handleUserError(result?: any) {
    return (error: HttpErrorResponse): Observable<UserData | undefined> => {
      if(result == "getUserData") {
        console.log("INVALID TOKEN");
        this.signOut().subscribe(r => {
          this.router.navigate(["login"]);
        });
      }
      return of(undefined);
    };
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open(error.error?.message || "A apărut o eroare.");
      return of(result as T);
    };
  }


  private handleAuthError(result?: any) {
    return (error: HttpErrorResponse): Observable<AuthResponse> => {
      this.snackbar.open(error.error?.message || "A apărut o eroare.");
      return of({ error: error.error.name || true } as AuthResponse);
    };
  }
}

interface AuthResponse {
  token?: string,
  user?: UserData,
  error?: string
}

export interface Profile {
  bio: string,
  website: string,
  picture: string,
}

export interface UserData {
  id: number,
  firstName: string,
  lastName: string,
  title?: string,
  fullName: string,
  CNP: string,
  email: string,
  validated: boolean,
  type: "student" | "teacher" | "admin",
  isImpersonated: boolean,
  student?: {
    id?: number,
    userId?: number,
    domainId?: number,
    specializationId?: number,
    group: string,
    domain: Domain,
    specialization: DomainSpecialization,
    promotion: string,
    identificationCode: string, // cod matricol
    studyForm: 'if' | 'id' | 'ifr',
    matriculationYear: string,
    fundingForm: 'budget' | 'tax',
    paper: Paper
  },
  teacher?: {
    id: number
  },
  profile?: Profile,
}

export interface UserDataMin {
  id: number,
  firstName: string,
  lastName: string,
  title?: string,
  fullName?: string,
  email?: string,
  profile?: Profile,
}

export type DomainType = 'bachelor' | 'master';
export type PaperType = 'bachelor' | 'diploma' | 'master';

export interface Domain {
  id: number,
  name: string,
  type: DomainType,
  paperType: PaperType,
  studentNumber?: number,
  offerNumber?: number,
  specializations: DomainSpecialization[]
}

export interface DomainSpecialization {
  id: number,
  name: string,
  studyYears: number,
  studentNumber?: number
}

export interface Paper {
  id: number,
  title: string,
  description: string,
  type: PaperType,
  isValid: boolean | null,
  teacher?: UserDataMin,
  teacherId: number,
  student?: UserDataMin,
  documents: PaperDocument[],
  committee?: Committee,
  topics?: Topic[],
  requiredDocuments?: PaperRequiredDocument[],
  grades: PaperGrade[],
  gradeAverage: number;
  createdAt: string;
  submitted: boolean;
}

export interface PaperDocument {
  id: number,
  name: string,
  mimeType: string,
  type: 'generated' | 'signed' | 'copy'
}

export interface PaperGrade {
  forPaper: number,
  forPresentation: number,
  teacherId: number;
  teacher: {
    user: UserDataMin
  }
}

export interface SessionSettingsI {
  sessionName: string, // name of the session
  currentPromotion: string,
  applyStartDate: string, // YYYY-MM-DD
  applyEndDate: string,
  fileSubmissionStartDate: string,
  fileSubmissionEndDate: string,
  paperSubmissionEndDate: string,
  allowGrading: boolean,
}

export class SessionSettings implements SessionSettingsI {
  public sessionName: string;
  public currentPromotion: string;
  public applyStartDate: string;
  public applyEndDate: string;
  public fileSubmissionStartDate: string;
  public fileSubmissionEndDate: string;
  public paperSubmissionEndDate: string;
  public allowGrading: boolean;

  constructor(sessionSettings: SessionSettingsI) {
    this.sessionName = sessionSettings.sessionName;
    this.currentPromotion = sessionSettings.currentPromotion;
    this.applyStartDate = sessionSettings.applyStartDate;
    this.applyEndDate = sessionSettings.applyEndDate;
    this.fileSubmissionStartDate = sessionSettings.fileSubmissionStartDate;
    this.fileSubmissionEndDate = sessionSettings.fileSubmissionEndDate;
    this.paperSubmissionEndDate = sessionSettings.paperSubmissionEndDate;
    this.allowGrading = sessionSettings.allowGrading;
  }

  public canApply(): boolean {
    const startDate = parseDate(this.applyStartDate);
    const endDate = inclusiveDate(this.applyEndDate);
    return startDate.getTime() <= Date.now() && Date.now() <= endDate.getTime();
  }

  public canUploadSecretaryFiles() {
    const startDate = parseDate(this.fileSubmissionStartDate);
    const endDate = inclusiveDate(this.fileSubmissionEndDate);
    return startDate.getTime() <= Date.now() && Date.now() <= endDate.getTime();
  }

  public canUploadPaperFiles() {
    const startDate = parseDate(this.fileSubmissionStartDate);
    const endDate = inclusiveDate(this.paperSubmissionEndDate);
    return startDate.getTime() <= Date.now() && Date.now() <= endDate.getTime();
  }
}

export interface Committee {
  id: number,
  name: string,
  finalGrades: boolean,
  domains: Domain[],
  members: CommitteeMember[],
  papers: Paper[]
}

export interface CommitteeMember {
  teacherId: number,
  role: 'president' | 'secretary' | 'member',
  user?: UserDataMin
}