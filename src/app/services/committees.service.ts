import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Committee, CommitteeMemberRole } from "../lib/types";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'any'
})
export class CommitteesService {

  constructor(
    private readonly http: HttpClient,
  ) {}

  private readonly baseUrl = `${environment.apiUrl}/committees`;

  findAll() {
    return this.http.get<Committee[]>(this.baseUrl);
  }

  findOne(id: number) {
    return this.http.get<Committee>(`${this.baseUrl}/${id}`);
  }

  create(dto: CommitteeDto) {
    return this.http.post<Committee>(this.baseUrl, dto);
  }

  update(id: number, dto: CommitteeDto) {
    return this.http.put<Committee>(`${this.baseUrl}/${id}`, dto);
  }

  setPapers(id: number, paperIds: number[]) {
    return this.http.put<Committee>(`${this.baseUrl}/${id}/papers`, { paperIds });
  }

  markGradesFinal(id: number, finalGrades = true) {
    return this.http.put<Committee>(`${this.baseUrl}/${id}/final-grades`, { finalGrades });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

type CommitteeDto = Pick<Committee, 'name' | 'activityDays'> & {
  domainIds: number[];
  members: {
    teacherId: number;
    role: CommitteeMemberRole;
  }[];
};
