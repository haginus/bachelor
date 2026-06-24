import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Document } from '../lib/types';
import { FilesService } from './files.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  constructor(
    private http: HttpClient,
    private filesService: FilesService,
  ) {}

  uploadDocument(paperId: number, name: string, type: string, file: File): Observable<Document> {
    const url = `${environment.apiUrl}/documents/upload`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('paperId', String(paperId));
    return this.http.post<Document>(url, formData);
  }

  signDocument(paperId: number, name: string) {
    const url = `${environment.apiUrl}/documents/sign`;
    return this.http.post<Document>(url, { name, paperId });
  }

  getDocument(id: number): Observable<File> {
    const url = `${environment.apiUrl}/documents/${id}/content`;
    return this.filesService.getFileWithProgress(url, { indeterminateTitle: 'Se descarcă documentul...', determinateTitle: 'Se descarcă documentul...' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/documents/${id}`);
  }

  getDocumentUploadHistory(paperId: number, name: string): Observable<Document[]> {
    const url = `${environment.apiUrl}/documents/history?paperId=${paperId}&name=${name}`;
    return this.http.get<Document[]>(url);
  }

}
