import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject, firstValueFrom } from 'rxjs';
import { skipAuthToken } from '../interceptors/auth.interceptor';
import { skipErrorToken } from '../interceptors/error.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AccessTokenService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokensKey = 't';
  private tokensRefreshSubject = new Subject<Tokens | null>();
  private tokenChanges = new Subject<Tokens | null>();
  public tokenChanges$ = this.tokenChanges.asObservable();

  public setTokens(tokens: Tokens) {
    localStorage.setItem(
      this.tokensKey,
      JSON.stringify([tokens.accessToken, tokens.refreshToken])
    );
    this.tokenChanges.next(tokens);
  }

  public removeTokens() {
    localStorage.removeItem(this.tokensKey);
    this.tokenChanges.next(null);
  }

  private parseTokenPayload() {
    const tokens = localStorage.getItem(this.tokensKey);
    if(tokens) {
      try {
        const [accessToken, refreshToken] = JSON.parse(tokens) as [string, string];
        return {
          accessToken: JSON.parse(atob(accessToken.split('.')[1])),
          refreshToken: JSON.parse(atob(refreshToken.split('.')[1])),
        };
      } catch(e) {
        console.error(e);
        return null;
      }
    }
    return null;
  }

  public hasTokens() {
    const { refreshToken } = this.parseTokenPayload() || {};
    const now = Date.now() / 1000;
    return refreshToken?.['exp'] > now;
  }

  public async refreshTokens(refreshToken?: string) {
    refreshToken = refreshToken || this.getTokensNoRefresh()?.refreshToken;
    if(!refreshToken) {
      this.removeTokens();
      return null;
    }
    if(!this.tokensRefreshSubject.observed) {
      this.executeRefreshTokens(refreshToken);
    }
    return firstValueFrom(this.tokensRefreshSubject);
  }

  private async executeRefreshTokens(refreshToken: string) {
    const context = new HttpContext();
    context.set(skipAuthToken, true);
    context.set(skipErrorToken, true);
    try {
      const tokens = await firstValueFrom(
        this.http.post<Tokens>(`${this.apiUrl}/refresh`, { refreshToken }, { context })
      );
      this.setTokens(tokens);
      this.tokensRefreshSubject.next(tokens);
    } catch(e) {
      this.removeTokens();
      this.tokensRefreshSubject.next(null);
      console.error(e);
    }
  }

  private getTokensNoRefresh() {
    const tokens = localStorage.getItem(this.tokensKey);
    if(tokens) {
      try {
        const [accessToken, refreshToken] = JSON.parse(tokens) as [string, string];
        return { accessToken, refreshToken };
      } catch(e) {
        console.error(e);
        return null;
      }
    }
    return null;
  }

  public async getTokens() {
    const tokens = localStorage.getItem(this.tokensKey);
    const payloads = this.parseTokenPayload();
    if(payloads) {
      try {
        const [accessToken, refreshToken] = JSON.parse(tokens!) as [string, string];
        const accessTokenExpiresAt = payloads.accessToken['exp'];
        const refreshTokenExpiresAt = payloads.refreshToken['exp'];
        const now = Date.now() / 1000;
        if(refreshTokenExpiresAt < now) {
          this.removeTokens();
          return null;
        }
        if(accessTokenExpiresAt < now) {
          return this.refreshTokens(refreshToken);
        }
        return {
          accessToken,
          refreshToken,
        };
      } catch(e) {
        console.error(e);
        return null;
      }
    }
    return null;
  }

  public async getAccessToken(): Promise<string | null> {
    return (await this.getTokens())?.accessToken || null;
  }

  public async getRefreshToken(): Promise<string | null> {
    return (await this.getTokens())?.refreshToken || null;
  }

}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}
