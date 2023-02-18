import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StudentSetupComponent } from './pages/setup/student-setup.component';
import { StundentTeachersGridComponent } from './pages/teachers-grid/teachers-grid.component';
import { OfferApplicationSenderComponent } from './dialogs/offer-application-sender/offer-application-sender.component';
import { SharedModule } from '../shared/shared.module';
import { StudentApplicationsComponent } from './pages/applications/applications.component';
import { StudentPaperComponent } from './pages/paper/paper.component';
import { StudentExtraDataEditorComponent } from './dialogs/student-extra-data-editor/student-extra-data-editor.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';


const materialDeps = [
  MatStepperModule,
  MatButtonToggleModule,
  MatSelectModule,
  MatCheckboxModule
]

@NgModule({
  declarations: [
    StudentComponent,
    StudentSetupComponent,
    StundentTeachersGridComponent,
    OfferApplicationSenderComponent,
    StudentApplicationsComponent,
    StudentPaperComponent,
    StudentExtraDataEditorComponent,
  ],
  imports: [
    CommonModule,
    StudentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ...materialDeps
  ]
})
export class StudentModule { }
