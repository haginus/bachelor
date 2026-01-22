import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class AccessTokenService {

  getToken(): string | null {
    return localStorage.getItem('token');
  }

}
