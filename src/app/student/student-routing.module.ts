import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotValidatedGuard } from '../guards/not-validated.guard';
import { ValidatedGuard } from '../guards/validated.guard';
import { StudentApplicationsComponent } from './pages/applications/applications.component';
import { StudentPaperComponent } from './pages/paper/paper.component';
import { StudentSetupComponent } from './pages/setup/student-setup.component';
import { StundentTeachersGridComponent } from './pages/teachers-grid/teachers-grid.component';
import { StudentComponent } from './student.component';

const routes: Routes = [
  { path: '', component: StudentComponent, canActivate: [ValidatedGuard] },
  { path: 'setup', component: StudentSetupComponent, data: { hideDrawer: true, title: "ROUTE_TITLES.STUDENT.VALIDATION" }, canActivate: [NotValidatedGuard] },
  { path: 'teachers', component: StundentTeachersGridComponent, data: { title: "ROUTE_TITLES.STUDENT.ALL_TEACHERS", mode: "all" }, canActivate: [ValidatedGuard] },
  { path: 'suggested-teachers', component: StundentTeachersGridComponent, data: { title: "ROUTE_TITLES.STUDENT.SUGGESTED_TEACHERS", mode: "suggested" }, canActivate: [ValidatedGuard] },
  { path: 'applications', component: StudentApplicationsComponent, data: { title: "ROUTE_TITLES.STUDENT.APPLICATIONS" }, canActivate: [ValidatedGuard] },
  { path: 'applications/:state', component: StudentApplicationsComponent, data: { title: "ROUTE_TITLES.STUDENT.APPLICATIONS" }, canActivate: [ValidatedGuard] },
  { path: 'paper', component: StudentPaperComponent, data: { title: "ROUTE_TITLES.STUDENT.YOUR_PAPER" }, canActivate: [ValidatedGuard] }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
