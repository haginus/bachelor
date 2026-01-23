import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Paginated, Teacher } from '../lib/types';
import { removeEmptyProperties } from '../lib/utils';

@Injectable({
  providedIn: 'any'
})
export class TeachersService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/teachers`;

  findAll(params?: { limit?: number; offset?: number; sortBy?: string; sortDirection?: 'asc' | 'desc'; lastName?: string; firstName?: string; email?: string }): Observable<Paginated<Teacher>> {
    return this.http.get<Paginated<Teacher>>(this.baseUrl, { params: removeEmptyProperties(params || {}) });
  }

  findOne(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.baseUrl}/${id}`);
  }

  create(dto: TeacherDto): Observable<Teacher> {
    return this.http.post<Teacher>(this.baseUrl, dto);
  }

  bulkCreate(): Observable<Teacher[]> {
    return null;
  }

  update(id: number, dto: TeacherDto): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}

type TeacherDto = Omit<Teacher, 'id' | 'type' | 'validated' | 'fullName'>;
