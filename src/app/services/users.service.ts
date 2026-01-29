import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'any'
})
export class UsersService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/users`;

  sendActivationEmail(userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/resend-activation-email`, {});
  }

}

