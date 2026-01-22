import { Injectable } from "@angular/core";
import { HttpContextToken, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getErrorMessage } from "../lib/utils";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if(req.context.get(skipErrorToken)) {
      return next.handle(req);
    }
    return next.handle(req).pipe(
      catchError(err => {
        const message = getErrorMessage(err);
        this.snackBar.open(message, undefined, { duration: 6000 });
        throw err;
      })
    );
  }
}

export const skipErrorToken = new HttpContextToken<boolean>(() => false);
