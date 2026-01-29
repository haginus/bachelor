import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ImportResult, Paginated, Teacher } from '../lib/types';
import { removeEmptyProperties } from '../lib/utils';

@Injectable({
  providedIn: 'any'
})
export class TeachersService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/teachers`;

  findAll(params?: { limit?: number; offset?: number; sortBy?: string; sortDirection?: 'asc' | 'desc'; lastName?: string; firstName?: string; email?: string; onlyMissingPlagiarismReports?: boolean; detailed?: boolean; }): Observable<Paginated<Teacher>> {
    return this.http.get<Paginated<Teacher>>(this.baseUrl, { params: removeEmptyProperties(params || {}) });
  }

  findOne(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.baseUrl}/${id}`);
  }

  create(dto: TeacherDto): Observable<Teacher> {
    return this.http.post<Teacher>(this.baseUrl, dto);
  }

  import(file: File): Observable<ImportResult<TeacherDto, Teacher>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImportResult<TeacherDto, Teacher>>(`${this.baseUrl}/import`, formData);
  }

  update(id: number, dto: TeacherDto): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}

type TeacherDto = Pick<Teacher, 'title' | 'firstName' | 'lastName' | 'CNP' | 'email'>;
