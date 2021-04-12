import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaperRequiredDocument } from './student.service';
import { Topic } from './topics.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { 
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

  public loginState = new BehaviorSubject(this.isSignedIn());

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

  signInWithEmailAndPassword(email: string, password: string) : Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/login`;
    return this.http.post<AuthResponse>(url, { email, password }).pipe(
      map(res => {
        this.setToken((res as any).token);
        this.loginState.next(true);
        this.userDataSource.next((res as any).user);
        return res
      }),
      catchError(this.handleError('signInWithEmailAndPassword'))
    );
  }

  signInWithTokenAndChangePassword(token: string, password: string, passwordConfirm): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/change-password-token`;
    return this.http.post<AuthResponse>(url, { token, password, passwordConfirm }).pipe(
      map(res => {
        this.setToken((res as any).token);
        this.loginState.next(true);
        this.userDataSource.next((res as any).user);
        return res
      }),
      catchError(this.handleError('signInWithTokenAndChangePassword'))
    );
  }

  signOut() : Observable<boolean> {
    this.removeToken();
    this.loginState.next(false);
    return of(true);
  }

  getPrivateHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.getToken(),
      }),
      withCredentials: false,
    };
  }

  userDataSource: ReplaySubject<UserData | undefined> = new ReplaySubject<UserData | undefined>(1);
  userData = this.userDataSource.asObservable();

  getUserData() : Observable<UserData | undefined> {
    const url = `${environment.apiUrl}/user/info`;
    return this.http.get<UserData>(url, this.getPrivateHeaders()).pipe(
      catchError(this.handleUserError('getUserData'))
    );
  }

  sessionSettingsSource: ReplaySubject<SessionSettings> = new ReplaySubject<SessionSettings>(1);
  sessionSettings = this.sessionSettingsSource.asObservable();

  getSessionSettings(): Observable<SessionSettings> {
    const url = `${environment.apiUrl}/auth/session`;
    return this.http.get<SessionSettings>(url).pipe(
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


  private handleError(result?: any) {
    return (error: HttpErrorResponse): Observable<AuthResponse> => {
      if (error.status == 401) {
        return of({ error: error.error.error } as AuthResponse);
      } else {
        return of({ error: "OTHER" });
      }
    };
  }
}

interface AuthResponse {
  token?: string,
  user?: UserData,
  error?: string
}

export interface UserData {
  id: number,
  firstName: string,
  lastName: string,
  fullName: string,
  CNP: string,
  email: string,
  validated: boolean,
  type: "student" | "teacher" | "admin",
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
  }
}

export interface UserDataMin {
  id: number,
  firstName: string,
  lastName: string,
  email?: string
}

export interface Domain {
  id: number,
  name: string,
  type: "bachelor" | "master",
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
  type: "bachelor" | "master",
  teacher?: UserDataMin,
  teacherId: number,
  student?: UserDataMin,
  documents: PaperDocument[],
  committee?: Committee,
  topics?: Topic[],
  requiredDocuments?: PaperRequiredDocument[]
}

export interface PaperDocument {
  id: number,
  name: string,
  mimeType: string,
  type: 'generated' | 'signed' | 'copy'
}

export interface SessionSettings {
  sessionName: string, // name of the session
  currentPromotion: string,
  applyStartDate: string, // YYYY-MM-DD
  applyEndDate: string,
  fileSubmissionStartDate: string,
  fileSubmissionEndDate: string,
  paperSubmissionEndDate: string
}

export interface Committee {
  id: number,
  name: string,
  domains: Domain[],
  members: CommitteeMember[],
  papers: Paper[]
}

export interface CommitteeMember {
  teacherId: number,
  role: 'president' | 'secretary' | 'member',
  user?: UserDataMin
}