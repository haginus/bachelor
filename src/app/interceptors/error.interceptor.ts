import { inject } from "@angular/core";
import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, from, map } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { getErrorMessage } from "../lib/utils";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if(req.context.get(skipErrorToken)) {
    return next(req);
  }
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
    catchError(err => from(parseError(err)).pipe(
      map(parsedError => {
        const message = getErrorMessage(parsedError);
        snackBar.open(message, undefined, { duration: 6000 });
        throw parsedError;
      })
    ))
  );
};

async function parseError(err: HttpErrorResponse): Promise<HttpErrorResponse> {
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

export const skipErrorToken = new HttpContextToken<boolean>(() => false);
