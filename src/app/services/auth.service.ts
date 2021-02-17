import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

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
    return this.http.post(url, { email, password }).pipe(
      map(res => {
        this.setToken((res as any).token);
        this.loginState.next(true);
        return {token: (res as any).token }
      }),
      catchError(this.handleError('signInWithEmailAndPassword'))
    );
  }

  signOut() : Observable<boolean> {
    this.removeToken();
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
  error?: string
}
