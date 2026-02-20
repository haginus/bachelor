import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ISessionSettings, SessionSettings } from "../lib/types";
import { environment } from "../../environments/environment";
import { map, tap } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'any'
})
export class SessionSettingsService {

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  private readonly baseUrl = `${environment.apiUrl}/session`;

  updateSessionSettings(settings: Partial<ISessionSettings>) {
    return this.http.patch<ISessionSettings>(this.baseUrl, settings).pipe(
      map(response => new SessionSettings(response)),
      tap(settings => this.authService.sessionSettingsSource.next(settings))
    );
  }

  beginNewSession() {
    return this.http.post<ISessionSettings>(`${this.baseUrl}/new`, {}).pipe(
      map(response => new SessionSettings(response)),
      tap(settings => this.authService.sessionSettingsSource.next(settings))
    );
  }

}
