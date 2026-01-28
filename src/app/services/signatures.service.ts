import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Signature } from '../lib/types';

@Injectable({
  providedIn: 'any'
})
export class SignaturesService {

  private url = `${environment.apiUrl}/signatures`;

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  async getUserSignature(userId: number) {
    const signature = await firstValueFrom(this.http.get<Signature>(`${this.url}/user/${userId}`));
    if(!signature) {
      return null;
    }
    const sample = await this.getSignatureSample(signature.id);
    return {
      ...signature,
      sample,
    }
  }

  createOrUpdateUserSignature(userId: number, sample: File): Promise<Signature> {
    const formData: FormData = new FormData();
    if(sample) {
      formData.append('sample', sample, 'sample.png');
    }
    return firstValueFrom(this.http.put<Signature>(`${this.url}/user/${userId}`, formData));
  }

  private getSignatureSample(id: number): Promise<string> {
    return firstValueFrom(
      this.http
        .get<any>(`${this.url}/${id}/sample`, { responseType: 'arraybuffer' as 'json' })
        .pipe(
          map(buffer => {
            const blob = new Blob([buffer], { type: "image/png" });
            return window.URL.createObjectURL(blob);
          }),
          catchError(() => of(null))
        )
    );
  }
}
