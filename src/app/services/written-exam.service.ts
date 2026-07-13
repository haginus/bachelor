import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ImportResponse, ImportSpecification, WrittenExamGrade } from "../lib/types";
import { ImportJobsService } from "./import-jobs.service";

@Injectable({
  providedIn: 'any'
})
export class WrittenExamService {

  constructor(
    private http: HttpClient,
    private importJobsService: ImportJobsService,
  ) {}

  private readonly apiUrl = `${environment.apiUrl}/written-exam`;

  gradeSubmission(submissionId: number, payload: GradePayload): Observable<WrittenExamGrade> {
    return this.http.post<WrittenExamGrade>(`${this.apiUrl}/grades/${submissionId}`, payload);
  }

  getImportGradesSpecification(): Observable<ImportSpecification> {
    return this.http.get<ImportSpecification>(`${this.apiUrl}/grades/import/specification`);
  }

  importGrades(file: File) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.importJobsService.createAndWatchImportJob<GradePayload, WrittenExamGrade>(
      () => this.http.post<ImportResponse<GradePayload, WrittenExamGrade>>(`${this.apiUrl}/grades/import`, formData)
    );
  }

  disputeGrade(submissionId: number): Observable<WrittenExamGrade> {
    return this.http.post<WrittenExamGrade>(`${this.apiUrl}/grades/${submissionId}/dispute`, {});
  }

}

type GradePayload = {
  initialGrade: number;
  disputeGrade: number | null;
}

