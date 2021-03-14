import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { StudentComponent } from './student.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { StudentSetupComponent } from './pages/setup/student-setup.component';
import { StundentTeachersGridComponent } from './pages/teachers-grid/teachers-grid.component';
import { OfferApplicationSenderComponent } from './dialogs/offer-application-sender/offer-application-sender.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    StudentComponent,
    StudentSetupComponent,
    StundentTeachersGridComponent,
    OfferApplicationSenderComponent
  ],
  imports: [
    CommonModule,
    StudentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ]
})
export class StudentModule { }
