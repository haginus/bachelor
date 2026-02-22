import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ImportResult, WrittenExamGrade } from "../lib/types";

@Injectable({
  providedIn: 'any'
})
export class WrittenExamService {

  constructor(
    private http: HttpClient,
  ) {}

  private readonly apiUrl = `${environment.apiUrl}/written-exam`;

  gradeSubmission(submissionId: number, payload: GradePayload): Observable<WrittenExamGrade> {
    return this.http.post<WrittenExamGrade>(`${this.apiUrl}/grades/${submissionId}`, payload);
  }

  importGrades(file: File): Observable<ImportResult<GradePayload, WrittenExamGrade>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImportResult<GradePayload, WrittenExamGrade>>(`${this.apiUrl}/grades/import`, formData);
  }

  disputeGrade(submissionId: number): Observable<WrittenExamGrade> {
    return this.http.post<WrittenExamGrade>(`${this.apiUrl}/grades/${submissionId}/dispute`, {});
  }

}

type GradePayload = {
  initialGrade: number;
  disputeGrade: number | null;
}

