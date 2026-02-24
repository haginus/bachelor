import { Injectable } from "@angular/core";
import { HttpContextToken, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { AccessTokenService } from "../services/access-token.service";
import { SudoService } from "../services/sudo.service";
import { from, switchMap } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly sudoService: SudoService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if(req.context.get(skipAuthToken)) {
      return next.handle(req);
    }
    return from(this.accessTokenService.getAccessToken()).pipe(
      switchMap(token => {
        if(!token) {
          return next.handle(req);
        }
        let headers = req.headers.set('Authorization', `Bearer ${token}`);
        const sudoPassword = this.sudoService.sudoPasswordSource.value;
        if(sudoPassword) {
          headers = headers.set('X-Sudo-Password', sudoPassword);
        }
        const authReq = req.clone({
          headers,
        });
        return next.handle(authReq);
      }),
    );
  }
}

export const skipAuthToken = new HttpContextToken<boolean>(() => false);
