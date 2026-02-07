import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ISessionSettings, SessionSettings } from "../lib/types";
import { environment } from "../../environments/environment";
import { map } from "rxjs";

@Injectable({
  providedIn: 'any'
})
export class SessionSettingsService {

  constructor(private readonly http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/session`;

  updateSessionSettings(settings: ISessionSettings) {
    return this.http.put<ISessionSettings>(this.baseUrl, settings).pipe(
      map(response => new SessionSettings(response))
    );
  }

  beginNewSession() {
    return this.http.post<ISessionSettings>(`${this.baseUrl}/new`, {}).pipe(
      map(response => new SessionSettings(response))
    );
  }

}
