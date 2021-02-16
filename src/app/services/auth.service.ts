import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private setToken(token : string) {
    return localStorage.setItem('token', token);
  }

  private removeToken() {
    return localStorage.removeItem('token');
  }

  signInWithEmailAndPassword(email: string, password: string) : Observable<AuthResponse> {
    const url = `http://${environment.apiUrl}/login`;
    return this.http.post(url, { email, password }).pipe(
      map(res => {
        this.setToken((res as any).token);
        return {token: (res as any).token }
      }),
      catchError(this.handleError('signInWithEmailAndPassword'))
    );
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
