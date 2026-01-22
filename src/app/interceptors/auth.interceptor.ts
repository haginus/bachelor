import { Injectable } from "@angular/core";
import { HttpContextToken, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { AccessTokenService } from "../services/access-token.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private accessTokenService: AccessTokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.accessTokenService.getToken();
    if(req.context.get(skipAuthToken) || !token) {
      return next.handle(req);
    }
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next.handle(authReq);
  }
}

export const skipAuthToken = new HttpContextToken<boolean>(() => false);
