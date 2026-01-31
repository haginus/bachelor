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

  findMine() {
    return this.http.get<Committee[]>(`${this.baseUrl}/me`);
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

  schedulePapers(dto: SchedulePapersDto) {
    return this.http.patch<Committee>(`${this.baseUrl}/${dto.committeeId}/schedule-papers`, dto);
  }

  gradePaper(dto: GradePaperDto) {
    return this.http.post<void>(`${this.baseUrl}/${dto.committeeId}/grade-paper`, dto);
  }

  getFile(committeeId: number, fileName: CommitteeFile) {
    return this.http.get<ArrayBuffer>(`${this.baseUrl}/${committeeId}/files/${fileName}`, {
      headers: {
        'Cache-Control': 'no-store',
      },
      responseType: 'blob' as 'json',
    });
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

type SchedulePapersDto = {
  committeeId: number;
  paperPresentationTime: number;
  publicScheduling: boolean;
  papers: { paperId: number; scheduledGrading: string | null }[];
};

type GradePaperDto = {
  paperId: number;
  committeeId: number;
  forPaper: number;
  forPresentation: number;
};

export const CommitteeFilesFormat = {
  'catalog_pdf': ['application/pdf', 'Catalog'],
  'catalog_docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Catalog'],
  'final_catalog_pdf': ['application/pdf', 'Catalog final'],
  'student_assignation_pdf': ['application/pdf', 'Programare studenți'],
  'student_assignation_xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Programare studenți'],
  'paper_documents_zip': ['application/zip', 'Arhivă lucrări'],
} as const satisfies Record<string, [string, string]>;

export type CommitteeFile = keyof typeof CommitteeFilesFormat;
