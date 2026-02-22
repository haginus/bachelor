import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Paginated, Submission } from "../lib/types";
import { removeEmptyProperties } from "../lib/utils";
import { FilesService } from "./files.service";

@Injectable({
  providedIn: 'any'
})
export class SubmissionsService {

  constructor(
    private readonly http: HttpClient,
    private readonly filesService: FilesService,
  ) {}

  private readonly apiUrl = `${environment.apiUrl}/submissions`;

  findAll(params: SubmissionQueryDto): Observable<Paginated<Submission>> {
    return this.http.get<Paginated<Submission>>(this.apiUrl, { params: removeEmptyProperties(params) });
  }

  findMine(): Observable<Submission> {
    return this.http.get<Submission>(`${this.apiUrl}/me`);
  }

  findOne(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.apiUrl}/${id}`);
  }

  getExportCsv() {
    return this.filesService.getFileWithProgress(`${this.apiUrl}/export/csv`);
  }

  getStats() {
    return this.http.get<SubmissionStats>(`${this.apiUrl}/stats`);
  }

  submit(id: number) {
    const url = `${this.apiUrl}/${id}/submit`;
    return this.http.post<Submission>(url, {});
  }

  unsubmit(id: number) {
    const url = `${this.apiUrl}/${id}/unsubmit`;
    return this.http.post<Submission>(url, {});
  }

}

export interface SubmissionQueryDto {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  hasWrittenExam?: boolean;
  writtenExamState?: string;
  domainId?: number;
  studentName?: string;
}

export interface SubmissionStats {
  totalWithWrittenExam: number;
  notGraded: number;
  initiallyGraded: number;
  disputed: number;
  disputeGraded: number;
}
