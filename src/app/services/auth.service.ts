import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest, firstValueFrom, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, first, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SudoService } from './sudo.service';
import { Profile, SessionSettings, SignUpRequest, User, UserExtraData } from '../lib/types';
import { AccessTokenService } from './access-token.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private readonly http: HttpClient,
    private readonly accessTokenService: AccessTokenService,
    private readonly router: Router,
    private readonly snackbar: MatSnackBar,
    private readonly sudoService: SudoService,
  ) {
    if(this.isSignedIn()) {
      combineLatest([this.getUserData(), this.getAlternativeIdentities()]).pipe(takeUntilDestroyed()).subscribe(([user, alternativeIdentities]) => {
        this.userDataSource.next(user);
        this.alternativeIdentitiesSource.next(alternativeIdentities);
      });
    } else {
      this.userDataSource.next(undefined);
      this.alternativeIdentitiesSource.next([]);
    }
    this.getSessionSettings().pipe(first()).subscribe(settings => {
      this.sessionSettingsSource.next(settings);
    });
    this.accessTokenService.tokenChanges$.pipe(takeUntilDestroyed()).subscribe(tokens => {
      if(!tokens) {
        this._onSignOut();
      }
    });
  }

  public isSignedIn(): boolean {
    return this.accessTokenService.hasTokens();
  }

  private handleAuthSuccess(res: AuthResponse) {
    this.accessTokenService.setTokens({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    });
    this.userDataSource.next(res.user);
    this.alternativeIdentitiesSource.next(res.alternativeIdentities || []);
    return res;
  }

  signInWithEmailAndPassword(email: string, password: string, recaptcha: string) : Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/sign-in`;
    return this.http.post<AuthResponse>(url, { email, password }, { headers: { recaptcha } }).pipe(
      map(res => this.handleAuthSuccess(res)),
      catchError(this.handleAuthError('signInWithEmailAndPassword'))
    );
  }

  signInWithTokenAndChangePassword(token: string, newPassword: string): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/sign-in/token`;
    return this.http.post<AuthResponse>(url, { token, newPassword }).pipe(
      map(res => this.handleAuthSuccess(res)),
      catchError(this.handleAuthError('signInWithTokenAndChangePassword'))
    );
  }

  switchUser(userId: number): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/switch/${userId}`;
    return this.http.post<AuthResponse>(url, {}).pipe(
      map(res => this.handleAuthSuccess(res)),
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
        this.handleAuthSuccess(res);
        return res;
      }),
      catchError(this.handleAuthError('impersonateUser'))
    );
  }

  releaseUser(): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/release`;
    return this.http.post<AuthResponse>(url, {}).pipe(
      map(res => this.handleAuthSuccess(res)),
      catchError(this.handleAuthError('releaseUser'))
    );
  }

  checkActivationToken(token: string) {
    const url = `${environment.apiUrl}/auth/check-activation-token`;
    return this.http.post<{ isSignUp: boolean; email: string; firstName: string; }>(url, { token });
  }

  checkSudoPassword(password: string): Observable<boolean> {
    const url = `${environment.apiUrl}/auth/sudo`;
    return this.http.post<any>(url, { password }).pipe(
      map(res => res.success),
      catchError(this.handleError("checkSudoPassword", false))
    );
  }

  enterSudoMode(): Observable<string> {
    return this.sudoService.enterSudoMode();
  }

  _onSignOut() {
    this.userDataSource.next(undefined);
    this.alternativeIdentitiesSource.next([]);
    this.router.navigate(["login"]);
  }

  signOut(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/sign-out`, {}).pipe(
      tap(() => {
        this.accessTokenService.removeTokens();
      }),
    );
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

  userDataSource: ReplaySubject<User | undefined> = new ReplaySubject<User | undefined>(1);
  userData = this.userDataSource.asObservable();
  alternativeIdentitiesSource: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);
  alternativeIdentities = this.alternativeIdentitiesSource.asObservable();

  getUserData(): Observable<User | undefined> {
    const url = `${environment.apiUrl}/auth/user`;
    return this.http.get<User>(url).pipe(
      catchError(this.handleUserError('getUserData'))
    );
  }

  getAlternativeIdentities(): Observable<User[]> {
    const url = `${environment.apiUrl}/auth/alternative-identities`;
    return this.http.get<User[]>(url).pipe(
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
    return this.http.patch<Profile>(url, formData).pipe(
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
        this.accessTokenService.removeTokens();
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
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  alternativeIdentities?: User[];
  error?: string;
}
