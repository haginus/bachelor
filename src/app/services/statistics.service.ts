import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Statistic } from '../lib/types';

@Injectable({
  providedIn: 'any'
})
export class StatisticsService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/statistics`;

  findAll(): Observable<Statistic[]> {
    return this.http.get<Statistic[]>(this.baseUrl);
  }

}

