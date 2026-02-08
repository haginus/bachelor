import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { notValidatedGuard } from '../guards/not-validated.guard';
import { paperGuard } from '../guards/paper.guard';
import { validatedGuard } from '../guards/validated.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [validatedGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/student-setup.component').then(m => m.StudentSetupComponent),
    data: { hideDrawer: true, title: "Validare" },
    canActivate: [notValidatedGuard]
  },
  {
    path: 'teachers',
    loadComponent: () => import('./pages/teachers-grid/teachers-grid.component').then(m => m.StudentTeachersGridComponent),
    data: { title: "Toți profesorii", mode: "all", hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'suggested-teachers',
    loadComponent: () => import('./pages/teachers-grid/teachers-grid.component').then(m => m.StudentTeachersGridComponent),
    data: { title: "Profesori sugerați", mode: "suggested", hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'applications',
    loadComponent: () => import('./pages/applications/applications.component').then(m => m.StudentApplicationsComponent),
    data: { title: "Cereri", hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'applications/:state',
    loadComponent: () => import('./pages/applications/applications.component').then(m => m.StudentApplicationsComponent),
    data: { title: "Cereri", hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'paper',
    loadComponent: () => import('./pages/paper/paper.component').then(m => m.StudentPaperComponent),
    data: { title: "Lucrarea dvs." },
    canActivate: [validatedGuard, paperGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
