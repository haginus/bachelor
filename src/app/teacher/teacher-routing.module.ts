import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotValidatedGuard } from '../guards/not-validated.guard';
import { ValidatedGuard } from '../guards/validated.guard';
import { TeacherOffersComponent } from './pages/offers/offers.component';
import { TeacherSetupComponent } from './pages/setup/setup.component';
import { TeacherComponent } from './teacher.component';
import { TeacherApplicationsComponent } from './pages/applications/applications.component'; 
import { TeacherPapersComponent } from './papers/papers.component';

const routes: Routes = [
  { path: '', component: TeacherComponent },
  { path: 'setup', component: TeacherSetupComponent, data: { hideDrawer: true, title: "Validare" }, canActivate: [NotValidatedGuard] },
  { path: 'offers', component: TeacherOffersComponent, data: { title: "Ofertele dvs." }, canActivate: [ValidatedGuard] },
  { path: 'applications', component: TeacherApplicationsComponent, data: { title: "Cereri" }, canActivate: [ValidatedGuard] },
  { path: 'applications/:state', component: TeacherApplicationsComponent, data: { title: "Cereri" }, canActivate: [ValidatedGuard] },
  { path: 'applications/:state/:offerId', component: TeacherApplicationsComponent, data: { title: "Cereri" }, canActivate: [ValidatedGuard] },
  { path: 'papers', component: TeacherPapersComponent, data: { title: "Cereri" }, canActivate: [ValidatedGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule { }
