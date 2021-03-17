import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { TeacherSetupComponent } from './pages/setup/setup.component';
import { MaterialModule } from '../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeacherOffersComponent } from './pages/offers/offers.component';
import { TeacherOfferDialogComponent } from './dialogs/teacher-offer-dialog/teacher-offer-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { TeacherApplicationsComponent } from './pages/applications/applications.component';


@NgModule({
  declarations: [
    TeacherComponent,
    TeacherSetupComponent,
    TeacherOffersComponent,
    TeacherOfferDialogComponent,
    TeacherApplicationsComponent
  ],
  imports: [
    CommonModule,
    TeacherRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule
  ]
})
export class TeacherModule { }
