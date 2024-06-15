import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotValidatedGuard } from '../guards/not-validated.guard';
import { PaperGuard } from '../guards/paper.guard';
import { ValidatedGuard } from '../guards/validated.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [ValidatedGuard]
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/student-setup.component').then(m => m.StudentSetupComponent),
    data: { hideDrawer: true, title: "Validare" },
    canActivate: [NotValidatedGuard]
  },
  {
    path: 'teachers',
    loadComponent: () => import('./pages/teachers-grid/teachers-grid.component').then(m => m.StudentTeachersGridComponent),
    data: { title: "Toți profesorii", mode: "all", hasPaper: false },
    canActivate: [ValidatedGuard, PaperGuard]
  },
  {
    path: 'suggested-teachers',
    loadComponent: () => import('./pages/teachers-grid/teachers-grid.component').then(m => m.StudentTeachersGridComponent),
    data: { title: "Profesori sugerați", mode: "suggested", hasPaper: false },
    canActivate: [ValidatedGuard, PaperGuard]
  },
  {
    path: 'applications',
    loadComponent: () => import('./pages/applications/applications.component').then(m => m.StudentApplicationsComponent),
    data: { title: "Cereri", hasPaper: false },
    canActivate: [ValidatedGuard, PaperGuard]
  },
  {
    path: 'applications/:state',
    loadComponent: () => import('./pages/applications/applications.component').then(m => m.StudentApplicationsComponent),
    data: { title: "Cereri", hasPaper: false },
    canActivate: [ValidatedGuard, PaperGuard]
  },
  {
    path: 'paper',
    loadComponent: () => import('./pages/paper/paper.component').then(m => m.StudentPaperComponent),
    data: { title: "Lucrarea dvs." },
    canActivate: [ValidatedGuard, PaperGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
