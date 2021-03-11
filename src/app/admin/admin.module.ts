import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminStudentsComponent } from './pages/students/students.component';
import { StudentDialogComponent } from './dialogs/new-student-dialog/student-dialog.component';
import { StudentsBulkAddDialogComponent } from './dialogs/students-bulk-add-dialog/students-bulk-add-dialog.component';
import { StudentDeleteDialogComponent } from './dialogs/student-delete-dialog/student-delete-dialog.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminTeacherDialogConmonent } from './dialogs/teacher-dialog/teacher-dialog.component';
import { AdminTeachersComponent } from './pages/teachers/teachers.component';
import { AdminTeacherDeleteDialogComponent } from './dialogs/teacher-delete-dialog/teacher-delete-dialog.component';
import { AdminTeacherBulkAddDialogComponent } from './dialogs/teacher-bulk-add-dialog/teacher-bulk-add-dialog.component';
import { AdminDomainsComponent } from './pages/domains/domains.component';
import { AdminDomainDialogComponent } from './dialogs/domain-dialog/domain-dialog.component';
import { SharedModule } from '../shared/shared.module';


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
    AdminDomainDialogComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AdminModule { }
