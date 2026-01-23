import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { removeEmptyProperties } from "../lib/utils";
import { TeacherOfferDto } from "../lib/types";

@Injectable({
  providedIn: 'any'
})
export class TeacherOffersService {

  constructor(private http: HttpClient) {}

  private readonly baseUrl = `${environment.apiUrl}/teacher-offers`;

  findAll(params?: { onlyActive?: boolean; topicIds?: number[]; isSuggested?: boolean; search?: string }): Observable<TeacherOfferDto[]> {
    return this.http.get<TeacherOfferDto[]>(this.baseUrl, { params: removeEmptyProperties(params || {}) });
  }
}
