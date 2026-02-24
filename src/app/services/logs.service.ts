import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, catchError, of } from "rxjs";
import { environment } from "../../environments/environment";
import { Paginated } from "../lib/types";

@Injectable({
  providedIn: 'any'
})
export class LogsService {

  constructor(private http: HttpClient, private snackbar: MatSnackBar) { }

  private readonly apiUrl = `${environment.apiUrl}/logs`;

  findAll(query: LogsQuery) {
    let url = `${this.apiUrl}?limit=${query.pagination.limit}&offset=${query.pagination.offset || 0}`;
    if(query.filters) {
      Object.keys(query.filters).forEach(key => {
        const value = query.filters[key] as MatchingOrNotMatching<any>;
        if(key === 'meta') {
          url += `&meta=${JSON.stringify(value)}`;
        } else {
          const join = (v?: any[], prefix: string = '') => v?.map(v => `${prefix}${v}`).join(',');
          let result = [join(value.matching), join(value.notMatching, '-')].filter(Boolean).join(',');
          if(result) {
            url += `&${key}=${result}`;
          }
        }
      });
    }
    return this.http
      .get<Paginated<any>>(url)
      .pipe(
        catchError(this.handleError<Paginated<any>>('findAll', { count: 0, rows: [] }))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.snackbar.open(error?.error.message || 'A apărut o eroare.');
      return of(result as T);
    };
  }
}

export interface LogsQuery {
  pagination: {
    limit: number;
    offset?: number;
  };
  filters?: {
    severity?: MatchingOrNotMatching<LogSeverity>;
    name?: MatchingOrNotMatching<any>;
    paperId?: MatchingOrNotMatching<number | null>;
  };
}

type MatchingOrNotMatching<T> = {
  matching?: T[];
  notMatching?: T[];
};

type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
