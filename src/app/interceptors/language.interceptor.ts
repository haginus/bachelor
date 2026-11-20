import { HttpInterceptorFn } from '@angular/common/http';
import { inject, LOCALE_ID } from '@angular/core';
import { environment } from '../../environments/environment';

export const languageInterceptor: HttpInterceptorFn = (request, next) => {
  const language = inject(LOCALE_ID).toLowerCase().split(/[-_]/)[0] === 'en' ? 'en' : 'ro';
  const api = environment.apiUrl.replace(/\/+$/, '');
  const isApi = request.url === api || request.url.startsWith(`${api}/`) || request.url.startsWith(`${api}?`);
  return next(isApi ? request.clone({ setHeaders: { 'Accept-Language': language } }) : request);
};
