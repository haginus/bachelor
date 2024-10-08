import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminStudentsComponent } from './pages/students/students.component';
import { StudentDialogComponent } from './dialogs/new-student-dialog/student-dialog.component';
import { StudentsBulkAddDialogComponent } from './dialogs/students-bulk-add-dialog/students-bulk-add-dialog.component';
import { StudentDeleteDialogComponent } from './dialogs/student-delete-dialog/student-delete-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminTeacherDialogConmonent } from './dialogs/teacher-dialog/teacher-dialog.component';
import { AdminTeachersComponent } from './pages/teachers/teachers.component';
import { AdminTeacherDeleteDialogComponent } from './dialogs/teacher-delete-dialog/teacher-delete-dialog.component';
import { AdminTeacherBulkAddDialogComponent } from './dialogs/teacher-bulk-add-dialog/teacher-bulk-add-dialog.component';
import { AdminDomainsComponent } from './pages/domains/domains.component';
import { AdminDomainDialogComponent } from './dialogs/domain-dialog/domain-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { AdminTopicsComponent } from './pages/topics/topics.component';
import { AdminTopicDialogComponent } from './dialogs/topic-dialog/topic-dialog.component';
import { SessionSettingsComponent } from './pages/session-settings/session-settings.component';
import { CommitteesComponent } from './pages/committees/committees.component';
import { CommitteeDialogComponent } from './dialogs/committee-dialog/committee-dialog.component';
import { PaperAssignComponent } from './pages/paper-assign/paper-assign.component';
import { AdminPapersComponent } from './pages/papers/papers.component';
import { NewSessionDialogComponent } from './dialogs/new-session-dialog/new-session-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TopicBulkDeleteDialogComponent } from './dialogs/topic-bulk-delete-dialog/topic-bulk-delete-dialog.component';
import { PaperValidationDialogComponent } from './dialogs/paper-validation-dialog/paper-validation-dialog.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SignUpRequestsComponent } from './pages/sign-up-requests/sign-up-requests.component';
import { SignUpRequestDialogComponent } from './dialogs/sign-up-request-dialog/sign-up-request-dialog.component';
import { AdminsComponent } from './pages/admins/admins.component';
import { AdminEditDialogComponent } from './dialogs/admin-edit-dialog/admin-edit-dialog.component';
import { SudoDialogComponent } from './dialogs/sudo-dialog/sudo-dialog.component';
import { ImportResultDialogComponent } from './dialogs/import-result-dialog/import-result-dialog.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { UploadFileDirective } from '../shared/directives/upload-file.directive';
import { CodeEditorModule } from '@ngstack/code-editor';
import { DatetimePipe } from '../shared/pipes/datetime.pipe';

const materialDeps = [
  MatPaginatorModule,
  DragDropModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatSortModule,
  MatSlideToggleModule,
  MatButtonToggleModule,
  MatCheckboxModule
]

@NgModule({
  declarations: [
    AdminComponent,
    AdminStudentsComponent,
    StudentDialogComponent,
    StudentsBulkAddDialogComponent,
    StudentDeleteDialogComponent,
    AdminTeachersComponent,
    AdminTeacherDialogConmonent,
    AdminTeacherDeleteDialogComponent,
    AdminTeacherBulkAddDialogComponent,
    AdminDomainsComponent,
    AdminDomainDialogComponent,
    AdminTopicsComponent,
    AdminTopicDialogComponent,
    SessionSettingsComponent,
    CommitteesComponent,
    CommitteeDialogComponent,
    PaperAssignComponent,
    AdminPapersComponent,
    NewSessionDialogComponent,
    TopicBulkDeleteDialogComponent,
    PaperValidationDialogComponent,
    ReportsComponent,
    SignUpRequestsComponent,
    SignUpRequestDialogComponent,
    AdminsComponent,
    AdminEditDialogComponent,
    SudoDialogComponent,
    ImportResultDialogComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxJsonViewerModule,
    UploadFileDirective,
    DatetimePipe,
    ...materialDeps
  ]
})
export class AdminModule { }
