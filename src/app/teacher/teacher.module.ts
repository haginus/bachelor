import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherRoutingModule } from './teacher-routing.module';
import { TeacherComponent } from './teacher.component';
import { TeacherSetupComponent } from './pages/setup/setup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeacherOffersComponent } from './pages/offers/offers.component';
import { TeacherOfferDialogComponent } from './dialogs/teacher-offer-dialog/teacher-offer-dialog.component';
import { SharedModule } from '../shared/shared.module';
import { TeacherApplicationsComponent } from './pages/applications/applications.component';
import { TeacherPapersComponent } from './pages/papers/papers.component';
import { TeacherCommitteesComponent } from './pages/committees/committees.component';
import { TeacherCommitteePapersComponent } from './pages/committee-papers/committee-papers.component';
import { GradePaperComponent } from './dialogs/grade-paper/grade-paper.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddPaperComponent } from './dialogs/add-paper/add-paper.component';

const materialDeps = [
  MatStepperModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatChipsModule,
  MatCheckboxModule
]

@NgModule({
  declarations: [
    TeacherComponent,
    TeacherSetupComponent,
    TeacherOffersComponent,
    TeacherOfferDialogComponent,
    TeacherApplicationsComponent,
    TeacherPapersComponent,
    TeacherCommitteesComponent,
    TeacherCommitteePapersComponent,
    GradePaperComponent,
    AddPaperComponent
  ],
  imports: [
    CommonModule,
    TeacherRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ...materialDeps
  ]
})
export class TeacherModule { }
