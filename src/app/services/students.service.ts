import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ImportResult, Paginated, Student } from '../lib/types';
import { removeEmptyProperties } from '../lib/utils';

@Injectable({
  providedIn: 'any'
})
export class StudentsService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/students`;

  findAll(params?: { limit?: number; offset?: number; sortBy?: string; sortDirection?: 'asc' | 'desc'; domainId?: number; specializationId?: number; group?: string; promotion?: string; lastName?: string; firstName?: string; email?: string }): Observable<Paginated<Student>> {
    return this.http.get<Paginated<Student>>(this.baseUrl, { params: removeEmptyProperties(params || {}) });
  }

  findOne(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  create(dto: StudentDto): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, dto);
  }

  import(file: File, specializationId: number): Observable<ImportResult<StudentDto, Student>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('specializationId', specializationId.toString());
    return this.http.post<ImportResult<StudentDto, Student>>(`${this.baseUrl}/import`, formData);
  }

  update(id: number, dto: StudentDto): Observable<{ student: Student; documentsGenerated?: boolean; }> {
    return this.http.put<{ student: Student; documentsGenerated?: boolean; }>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}

type StudentDto = Pick<Student, 'firstName' | 'lastName' | 'CNP' | 'identificationCode' | 'email' | 'promotion' | 'group' | 'matriculationYear' | 'fundingForm'> & {
  specializationId: number;
};
