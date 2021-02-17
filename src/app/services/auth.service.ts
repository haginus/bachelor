import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
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
    const url = `${environment.apiUrl}/login`;
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

  signOut() : Observable<boolean> {
    this.removeToken();
    this.loginState.next(false);
    return of(true);
  }

  getPrivateHeaders() {
    return {
      headers: new HttpHeaders({
        'content-type': 'application/json',
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
  CNP: string,
  email: string,
  validated: boolean,
  type: "student" | "teacher" | "admin",
  student?: {
    id?: number,
    userId?: 1,
    domainId?: 1,
    group: string,
    domain: Domain
  }
}

export interface Domain {
  id: number,
  name: string,
  type: "bachelor" | "master"
}

