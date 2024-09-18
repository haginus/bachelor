import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Signature } from '../lib/types';

@Injectable({
  providedIn: 'any'
})
export class SignaturesService {

  private url = `${environment.apiUrl}/signatures`;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  async getUserSignature(userId: number) {
    const signature = await firstValueFrom(this.http.get<Signature>(`${this.url}/user/${userId}`, this.auth.getPrivateHeaders()));
    if(!signature) {
      return null;
    }
    const sample = await this.getSignatureSample(signature.id);
    return {
      ...signature,
      sample,
    }
  }

  createOrUpdateUserSignature(sample: File): Promise<Signature> {
    const formData: FormData = new FormData();
    if(sample) {
      formData.append('sample', sample, 'sample.png');
    }
    return firstValueFrom(
        this.http.put<Signature>(`${this.url}/me`, formData, this.auth.getPrivateHeaders()).pipe(
        catchError(this.handleError("createOrUpdateUserSignature", null))
      )
    );
  }

  private getSignatureSample(id: number): Promise<string> {
    const options = this.auth.getPrivateHeaders();
    return firstValueFrom(
      this.http
        .get<any>(`${this.url}/${id}/sample`, { ...options, responseType: 'arraybuffer' as 'json' })
        .pipe(
          map(buffer => {
            const blob = new Blob([buffer], { type: "image/png" });
            return window.URL.createObjectURL(blob);
          }),
          catchError(this.handleError<any>('getSignatureSample', null))
        )
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      let msg = 'A apărut o eroare.';
      this.snackbar.open(msg);
      return of(result as T);
    };
  }
}
