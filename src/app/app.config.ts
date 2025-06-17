import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlRo } from './providers/mat-paginator-intl-ro';
import { environment } from '../environments/environment';
import { RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { CodeEditorModule } from '@ngstack/code-editor';
import localeRo from '@angular/common/locales/ro';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeRo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'ro-RO' },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000, horizontalPosition: 'center' } },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlRo },
    { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: environment.captchaKey, } },
    { provide: RECAPTCHA_LANGUAGE, useValue: "ro-RO" },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    },
    importProvidersFrom(CodeEditorModule.forRoot()),
  ],
};
