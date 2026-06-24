import { Injectable } from "@angular/core";
import { HttpContextToken, HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, from, map } from "rxjs";
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
      catchError(err => from(this.parseError(err)).pipe(
        map(parsedError => {
          const message = getErrorMessage(parsedError);
          this.snackBar.open(message, undefined, { duration: 6000 });
          throw parsedError;
        })
      ))
    );
  }

  private async parseError(err: HttpErrorResponse): Promise<HttpErrorResponse> {
    if(err.error instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(err.error);
        const parsedError = JSON.parse(text);
        return new HttpErrorResponse({
          ...err,
          error: parsedError,
        });
      } catch(e) {
        return err;
      }
    }
    if(err.error instanceof Blob) {
      try {
        const text = await err.error.text();
        const parsedError = err.error.type === 'application/json' ? JSON.parse(text) : text;
        return new HttpErrorResponse({
          ...err,
          error: parsedError,
        });
      } catch(e) {
        return err;
      }
    }
    return err;
  }
}

export const skipErrorToken = new HttpContextToken<boolean>(() => false);
