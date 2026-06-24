import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Signature } from '../lib/types';
import { FilesService } from './files.service';

@Injectable({
  providedIn: 'root'
})
export class SignaturesService {

  private url = `${environment.apiUrl}/signatures`;

  constructor(
    private http: HttpClient,
    private readonly filesService: FilesService,
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

  private async getSignatureSample(id: number): Promise<string> {
    const file = await firstValueFrom(this.filesService.getFile(`${this.url}/${id}/sample`, { showSnackBar: false }));
    return URL.createObjectURL(file);
  }
}
