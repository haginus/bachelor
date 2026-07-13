import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { map, Observable, of, switchMap } from "rxjs";
import { SseClient } from "./sse-client";
import { ImportResponse, ImportResult, ImportResultRow } from "../lib/types";

@Injectable({
  providedIn: 'root'
})
export class ImportJobsService {

  constructor(
    private readonly sseClient: SseClient,
  ) {}

  private readonly baseUrl = `${environment.apiUrl}/import-jobs`;

  watchImportJob<RowType, EntityType>(jobId: string): Observable<ImportResult<RowType, EntityType>> {
    let currentImportResult: ImportResult<RowType, EntityType> = {
      summary: {
        total: 0,
        processed: 0,
        created: 0,
        updated: 0,
        failed: 0,
      },
      rows: [],
    };
    return this.sseClient.get<ImportJobEvent<RowType, EntityType>>(`${this.baseUrl}/${jobId}/events`).pipe(
      map(event => {
        const data = event.data;
        switch (data.type) {
          case 'started':
            currentImportResult.summary.total = data.totalRows;
            break;
          case 'processed_row':
            currentImportResult.rows.push(data.row);
            currentImportResult.summary.processed++;
            currentImportResult.summary[data.row.result]++;
            break;
          case 'progress':
            currentImportResult = data.importResult;
            break;
          case 'completed':
            currentImportResult = data.importResult;
            break;
        }
        return currentImportResult;
      })
    );
  }

  createAndWatchImportJob<RowType, EntityType>(
    createFn: () => Observable<ImportResponse<RowType, EntityType>>,
  ): Observable<ImportResult<RowType, EntityType>> {
    return createFn().pipe(
      switchMap(result => {
        if('jobId' in result) {
          return this.watchImportJob<RowType, EntityType>(result.jobId);
        }
        return of(result);
      })
    );
  }

}

type ImportJobEvent<RowType, EntityType> =
  | { type: 'started'; totalRows: number; }
  | { type: 'processed_row'; row: ImportResultRow<RowType, EntityType>; }
  | { type: 'progress'; importResult: ImportResult<RowType, EntityType>; }
  | { type: 'completed'; importResult: ImportResult<RowType, EntityType>; };

