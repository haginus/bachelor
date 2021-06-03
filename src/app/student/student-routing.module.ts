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
  { path: 'setup', component: StudentSetupComponent, data: { hideDrawer: true, title: "Validare" }, canActivate: [NotValidatedGuard] },
  { path: 'teachers', component: StundentTeachersGridComponent, data: { title: "Toți profesorii", mode: "all" }, canActivate: [ValidatedGuard] },
  { path: 'suggested-teachers', component: StundentTeachersGridComponent, data: { title: "Profesori sugerați", mode: "suggested" }, canActivate: [ValidatedGuard] },
  { path: 'applications', component: StudentApplicationsComponent, data: { title: "Cereri" }, canActivate: [ValidatedGuard] },
  { path: 'applications/:state', component: StudentApplicationsComponent, data: { title: "Cereri" }, canActivate: [ValidatedGuard] },
  { path: 'paper', component: StudentPaperComponent, data: { title: "Lucrarea dvs." }, canActivate: [ValidatedGuard] }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
