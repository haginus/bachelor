import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignUpRequest, Student } from '../lib/types';
import { removeEmptyProperties } from '../lib/utils';

@Injectable({
  providedIn: 'any'
})
export class SignUpRequestsService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/sign-up-requests`;

  findAll(): Observable<SignUpRequest[]> {
    return this.http.get<SignUpRequest[]>(this.baseUrl);
  }

  findOne(id: number): Observable<SignUpRequest> {
    return this.http.get<SignUpRequest>(`${this.baseUrl}/${id}`);
  }

  accept(id: number, additionalDetails?: SignUpRequestPartialDto): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/${id}/accept`, removeEmptyProperties(additionalDetails || {}));
  }

  decline(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getExcelReport(): Observable<ArrayBuffer> {
    return this.http.get<ArrayBuffer>(`${this.baseUrl}/export/excel`, { responseType: 'arraybuffer' as 'json' });
  }

}

type SignUpRequestPartialDto = Partial<SignUpRequest> & { specializationId?: number; generalAverage?: number | null; };
