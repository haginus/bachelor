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
import { EditPaperComponent } from './dialogs/edit-paper/edit-paper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';


const materialDeps = [
  MatStepperModule,
  MatButtonToggleModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatChipsModule,
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
    EditPaperComponent
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
