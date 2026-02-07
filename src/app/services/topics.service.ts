import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Topic } from '../lib/types';
import { removeEmptyProperties } from '../lib/utils';

@Injectable({
  providedIn: 'any'
})
export class TopicsService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/topics`;

  findAll(params?: { sortBy?: string; sortDirection?: 'asc' | 'desc'; detailed?: boolean; }): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.baseUrl, { params }).pipe(
      catchError(this.handleError<Topic[]>('findAll', []))
    );
  }

  create(name: string): Observable<Topic> {
    return this.http.post<Topic>(this.baseUrl, { name });
  }

  bulkCreate(names: string[]): Observable<Topic[]> {
    const dtos = names.map(name => ({ name }));
    return this.http.post<Topic[]>(`${this.baseUrl}/bulk`, dtos);
  }

  update(id: number, name: string): Observable<Topic> {
    return this.http.put<Topic>(`${this.baseUrl}/${id}`, { name });
  }

  delete(id: number, moveToId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { params: removeEmptyProperties({ moveToId }) });
  }

  bulkDelete(ids: number[], moveToId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bulk`, { params: removeEmptyProperties({ ids: ids.join(','), moveToId }) });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    };
  }
}
