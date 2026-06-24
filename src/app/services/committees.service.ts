import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Committee, CommitteeMemberRole, ImportResult, Paper } from "../lib/types";
import { environment } from "../../environments/environment";
import { FilesService } from "./files.service";

@Injectable({
  providedIn: 'any'
})
export class CommitteesService {

  constructor(
    private readonly http: HttpClient,
    private readonly filesService: FilesService,
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

  autoAssignPapers() {
    return this.http.post<ImportResult<Paper, Paper>>(`${this.baseUrl}/auto-assign-papers`, {});
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
    return this.filesService.getFileWithProgress(`${this.baseUrl}/${committeeId}/files/${fileName}`, {
      indeterminateTitle: 'Se generează documentul...',
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

export type CommitteeFile =
  | 'catalog_pdf'
  | 'catalog_docx'
  | 'final_catalog_pdf'
  | 'student_assignation_pdf'
  | 'student_assignation_xlsx'
  | 'paper_documents_zip';
