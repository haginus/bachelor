import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private auth: AuthService, private http: HttpClient) { }
  
  watchUserData() : Observable<UserData | undefined> {
    return this.auth.loginState.pipe(
      switchMap(state => {
        if(!state)
          return of(undefined);
        else
          return this.getUserData();
      })
    )
  }

  getUserData() : Observable<UserData | undefined> {
    const url = `${environment.apiUrl}/user/info`;
    return this.http.get<UserData>(url, this.auth.getPrivateHeaders()).pipe(
      catchError(this.handleError('watchUserData'))
    );
  }

  private handleError(result?: any) {
    return (error: HttpErrorResponse): Observable<UserData | undefined> => {
      console.log(error)
      return of(undefined);
    };
  }

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
