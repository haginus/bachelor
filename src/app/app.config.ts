import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlRo } from './providers/mat-paginator-intl-ro';
import { environment } from '../environments/environment';
import { RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { CodeEditorModule } from '@ngstack/code-editor';
import localeRo from '@angular/common/locales/ro';
import { registerLocaleData } from '@angular/common';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

registerLocaleData(localeRo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'ro-RO' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000, horizontalPosition: 'center' } },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlRo },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: environment.captchaKey, } },
    { provide: RECAPTCHA_LANGUAGE, useValue: "ro-RO" },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    },
    importProvidersFrom(CodeEditorModule.forRoot()),
  ],
};
