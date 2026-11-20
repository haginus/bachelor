import { inject } from "@angular/core";
import { HttpContextToken, HttpInterceptorFn } from "@angular/common/http";
import { AccessTokenService } from "../services/access-token.service";
import { SudoService } from "../services/sudo.service";
import { from, switchMap } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if(req.context.get(skipAuthToken)) {
    return next(req);
  }
  const accessTokenService = inject(AccessTokenService);
  const sudoService = inject(SudoService);
  return from(accessTokenService.getAccessToken()).pipe(
    switchMap(token => {
      if(!token) {
        return next(req);
      }
      let headers = req.headers.set('Authorization', `Bearer ${token}`);
      const sudoPassword = sudoService.sudoPasswordSource.value;
      if(sudoPassword) {
        headers = headers.set('X-Sudo-Password', sudoPassword);
      }
      const authReq = req.clone({
        headers,
      });
      return next(authReq);
    }),
  );
};

export const skipAuthToken = new HttpContextToken<boolean>(() => false);
