import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { DocumentReuploadRequest } from "../lib/types";

@Injectable({
  providedIn: 'any'
})
export class DocumentReuploadRequestsService {

  constructor(
    private http: HttpClient,
  ) {}

  private readonly apiUrl = `${environment.apiUrl}/document-reupload-requests`;


  bulkCreate(dto: DocumentReuploadRequestBulkCreateDto) {
    return this.http.post<DocumentReuploadRequest[]>(this.apiUrl, dto);
  }

  cancel(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}

type DocumentReuploadRequestBulkCreateDto = {
  paperId: number;
  requests: {
    documentName: string;
    comment?: string | null;
    deadline: string;
  }[];
}
