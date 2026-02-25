import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../lib/types';

@Injectable({
  providedIn: 'any'
})
export class AdminsService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/admins`;

  findAll(params: { type?: 'admin' | 'secretary' } = {}): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl, { params });
  }

  findOne(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(dto: AdminDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, dto);
  }

  update(id: number, dto: AdminDto): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}

type AdminDto = Pick<User, 'firstName' | 'lastName' | 'email'> & {
  type: 'admin' | 'secretary';
};
