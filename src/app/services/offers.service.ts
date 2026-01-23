import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Offer } from '../lib/types';

@Injectable({
  providedIn: 'any'
})
export class OffersService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/offers`;

  findAll(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.baseUrl);
  }

  findMine(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/me`);
  }

  findOne(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.baseUrl}/${id}`);
  }

  create(dto: OfferDto): Observable<Offer> {
    return this.http.post<Offer>(this.baseUrl, dto);
  }

  bulkCreate(): Observable<Offer[]> {
    return null;
  }

  update(id: number, dto: OfferDto): Observable<Offer> {
    return this.http.put<Offer>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

}

type OfferDto = Pick<Offer, 'description' | 'limit'> & {
  domainId: number;
  topicIds: number[];
};
