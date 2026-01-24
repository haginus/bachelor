import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Application } from '../lib/types';
import { removeEmptyProperties } from '../lib/utils';

@Injectable({
  providedIn: 'any'
})
export class ApplicationsService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/applications`;

  findMine(params?: { state?: 'pending' | 'accepted' | 'declined'; offerId?: number }): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}/me`, { params: removeEmptyProperties(params) });
  }

  findOne(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.baseUrl}/${id}`);
  }

  create(dto: ApplicationDto): Observable<Application> {
    return this.http.post<Application>(this.baseUrl, dto);
  }

  accept(id: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${id}/accept`, {});
  }

  decline(id: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/${id}/decline`, {});
  }

  withdraw(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`);
  }

}

type ApplicationDto = Pick<Application, 'title' | 'description' | 'usedTechnologies'> & {
  offerId: number;
};
