import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StudentSetupComponent } from './setup/student-setup/student-setup.component';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from './shared/loading/loading.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminStudentsComponent } from './pages/admin/students/students.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { StudentDialogComponent } from './shared/dialogs/new-student-dialog/student-dialog.component';
import { StudentsBulkAddDialogComponent } from './shared/dialogs/students-bulk-add-dialog/students-bulk-add-dialog.component';
import { StudentDeleteDialogComponent } from './shared/dialogs/student-delete-dialog/student-delete-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    StudentSetupComponent,
    LoadingComponent,
    DashboardComponent,
    AdminStudentsComponent,
    StudentDialogComponent,
    StudentsBulkAddDialogComponent,
    StudentDeleteDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000 } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
