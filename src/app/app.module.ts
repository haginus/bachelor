import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { ChangePasswordComponent } from './user-components/change-password/change-password.component';
import { SharedModule } from './shared/shared.module'
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlRo } from './providers/mat-paginator-intl-ro';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RECAPTCHA_LANGUAGE, RECAPTCHA_SETTINGS, RecaptchaModule } from "ng-recaptcha";
import { environment } from 'src/environments/environment';
import { ProblemReportComponent } from './components/problem-report/problem-report.component';
import { MatSelectModule } from '@angular/material/select';

const materialDeps = [
  MatSidenavModule,
  MatSelectModule
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChangePasswordComponent,
    ProblemReportComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RecaptchaModule,
    ...materialDeps
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000 } },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlRo},
    { provide: RECAPTCHA_SETTINGS, useValue: { siteKey: environment.captchaKey, } },
    { provide: RECAPTCHA_LANGUAGE, useValue: "ro-RO" },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
