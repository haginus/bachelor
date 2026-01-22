import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Domain } from "../lib/types";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'any'
})
export class DomainsService {

  constructor(
    private readonly http: HttpClient,
  ) {}

  private readonly baseUrl = `${environment.apiUrl}/domains`;

  findAll(params?: { detailed?: boolean }) {
    return this.http.get<Domain[]>(this.baseUrl, { params });
  }

  findOne(id: number) {
    return this.http.get<Domain>(`${this.baseUrl}/${id}`);
  }

  create(domain: DomainDto) {
    return this.http.post<Domain>(this.baseUrl, domain);
  }

  update(id: number, domain: DomainDto) {
    return this.http.put<Domain>(`${this.baseUrl}/${id}`, domain);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

type DomainDto = Omit<Domain, 'id' | 'specializations'> & {
  specializations: (Omit<Domain['specializations'][number], 'id'> & { id?: number })[];
}
