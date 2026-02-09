import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest, firstValueFrom, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, first, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SudoService } from './sudo.service';
import { Profile, SessionSettings, SignUpRequest, User, UserExtraData } from '../lib/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackbar: MatSnackBar,
    private sudoService: SudoService,
  ) {
    if(this.isSignedIn()) {
      combineLatest([this.getUserData(), this.getAlternativeIdentities()]).subscribe(([user, alternativeIdentities]) => {
        this.userDataSource.next(user);
        this.alternativeIdentitiesSource.next(alternativeIdentities);
      })
    } else {
      this.userDataSource.next(undefined);
      this.alternativeIdentitiesSource.next([]);
    }
    this.getSessionSettings().pipe(first()).subscribe(settings => {
      this.sessionSettingsSource.next(settings);
    });
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

  public appendTokenQuery(url: string): string {
    const token = this.getToken();
    if(!token) return url;
    return url + (url.includes('?') ? '&' : '?') + 'token=' + token;
  }

  isSignedIn() : boolean {
    return this.getToken() != null;
  }

  signInWithEmailAndPassword(email: string, password: string, recaptcha: string) : Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/sign-in`;
    return this.http.post<AuthResponse>(url, { email, password }, { headers: { recaptcha } }).pipe(
      map(res => {
        this.setToken((res as any).accessToken);
        this.userDataSource.next((res as any).user);
        this.alternativeIdentitiesSource.next((res as any).alternativeIdentities || []);
        return res;
      }),
      catchError(this.handleAuthError('signInWithEmailAndPassword'))
    );
  }

  signInWithTokenAndChangePassword(token: string, newPassword: string): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/sign-in/token`;
    return this.http.post<AuthResponse>(url, { token, newPassword }).pipe(
      map(res => {
        this.setToken((res as any).accessToken);
        this.userDataSource.next((res as any).user);
        return res
      }),
      catchError(this.handleAuthError('signInWithTokenAndChangePassword'))
    );
  }

  switchUser(userId: number): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/switch/${userId}`;
    return this.http.post<AuthResponse>(url, {}, this.getPrivateHeaders()).pipe(
      map(res => {
        this.setToken((res as any).accessToken);
        this.userDataSource.next((res as any).user);
        this.alternativeIdentitiesSource.next((res as any).alternativeIdentities || []);
        return res;
      }),
      catchError(this.handleAuthError('switchUser'))
    );
  }

  impersonateUser(userId: number): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/impersonate/${userId}`;
    // @ts-ignore
    return this.enterSudoMode().pipe(
      switchMap(password => {
        if(!password) return of(null);
        return this.http.post<AuthResponse>(url, {});
      }),
      map(res => {
        if(!res) {
          return { error: { message: "Ați renunțat la intrarea în modul sudo." } };
        }
        this.setToken((res as any).accessToken);
        this.userDataSource.next((res as any).user);
        this.alternativeIdentitiesSource.next((res as any).alternativeIdentities || []);
        return res;
      }),
      catchError(this.handleAuthError('impersonateUser'))
    );
  }

  releaseUser(): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/release`;
    return this.http.post<AuthResponse>(url, {}, this.getPrivateHeaders()).pipe(
      map(res => {
        this.setToken((res as any).accessToken);
        this.userDataSource.next((res as any).user);
        this.alternativeIdentitiesSource.next((res as any).alternativeIdentities || []);
        return res;
      }),
      catchError(this.handleAuthError('releaseUser'))
    );
  }

  checkActivationToken(token: string) {
    const url = `${environment.apiUrl}/auth/check-activation-token`;
    return this.http.post<{ isSignUp: boolean; email: string; firstName: string; }>(url, { token });
  }

  checkSudoPassword(password: string): Observable<boolean> {
    const url = `${environment.apiUrl}/auth/sudo`;
    return this.http.post<any>(url, { password }, this.getPrivateHeaders()).pipe(
      map(res => res.success),
      catchError(this.handleError("checkSudoPassword", false))
    );
  }

  enterSudoMode(): Observable<string> {
    return this.sudoService.enterSudoMode();
  }

  signOut(): Observable<boolean> {
    this.removeToken();
    this.userDataSource.next(undefined);
    return of(true);
  }

  sendResetPasswordEmail(email: string, recaptcha: string) {
    const url = `${environment.apiUrl}/auth/request-password-reset`;
    return this.http.post<boolean>(url, { email }, { headers: { recaptcha } });
  }

  signUp(requestData: SignUpRequest, recaptcha: string) {
    const url = `${environment.apiUrl}/sign-up-requests`;
    return this.http.post<SignUpRequest>(url, requestData, { headers: { recaptcha } }).pipe(
      catchError(this.handleError('signUp', null))
    );
  }

  getPrivateHeaders() {
    let headers = new HttpHeaders();
    const token = this.getToken();
    if(token) {
      headers = headers.append('Authorization', 'Bearer ' + token);
    }
    if(this.sudoService.sudoPasswordSource.value) {
      headers = headers.append('X-Sudo-Password', this.sudoService.sudoPasswordSource.value);
    }
    return {
      headers,
      withCredentials: false,
    };
  }

  userDataSource: ReplaySubject<User | undefined> = new ReplaySubject<User | undefined>(1);
  userData = this.userDataSource.asObservable();
  alternativeIdentitiesSource: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  alternativeIdentities = this.alternativeIdentitiesSource.asObservable();

  getUserData(): Observable<User | undefined> {
    const url = `${environment.apiUrl}/auth/user`;
    return this.http.get<User>(url, this.getPrivateHeaders()).pipe(
      catchError(this.handleUserError('getUserData'))
    );
  }

  getAlternativeIdentities(): Observable<User[]> {
    const url = `${environment.apiUrl}/auth/alternative-identities`;
    return this.http.get<User[]>(url, this.getPrivateHeaders()).pipe(
      catchError(this.handleError('getAlternativeIdentities', []))
    );
  }

  getUserExtraData(userId: number | 'me' = 'me'): Observable<UserExtraData | null> {
    const url = `${environment.apiUrl}/users/${userId}/extra-data`;
    return this.http.get<UserExtraData>(url).pipe(
      catchError(this.handleError('getUserExtraData', null))
    );
  }

  updateUserExtraData(userId: number, data: UserExtraData) {
    const url = `${environment.apiUrl}/users/${userId}/extra-data`;
    return this.http.put<{ result: UserExtraData; documentsGenerated: boolean; }>(url, data);
  }

  sessionSettingsSource: ReplaySubject<SessionSettings> = new ReplaySubject<SessionSettings>(1);
  sessionSettings = this.sessionSettingsSource.asObservable();

  getSessionSettings(): Observable<SessionSettings> {
    const url = `${environment.apiUrl}/session`;
    return this.http.get<any>(url).pipe(
      map(settings => new SessionSettings(settings)),
      catchError(() => of(null))
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

  validateUser(topicIds?: number[]) : Observable<void> {
    const url = `${environment.apiUrl}/users/me/validate`;
    return this.http.post<void>(url, { topicIds }).pipe(
      tap(() => {
        firstValueFrom(this.userData).then(user => {
          (user as User).validated = true;
          this.userDataSource.next(user);
        });
      }),
    );
  }

  editProfile(picture: File, bio: string, website: string): Observable<Profile> {
    const url = `${environment.apiUrl}/users/me/profile`;
    const formData: FormData = new FormData();
    if(picture) {
      formData.append('picture', picture, picture.name);
    }
    formData.append('bio', bio);
    formData.append('website', website);
    return this.http.patch<Profile>(url, formData, this.getPrivateHeaders()).pipe(
      tap(profile => {
        this.userData.pipe(take(1)).subscribe(user => { // change
          (user as User).profile = profile;
          this.userDataSource.next(user);
        });
      }),
      catchError(this.handleError("editProfile", null))
    );
  }

  private handleUserError(result?: any) {
    return (error: HttpErrorResponse): Observable<User | undefined> => {
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
      return of({ error: error.error.error || true } as AuthResponse);
    };
  }
}

interface AuthResponse {
  token?: string;
  user?: User;
  alternativeIdentities?: User[];
  error?: string;
}
