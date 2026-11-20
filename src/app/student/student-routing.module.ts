import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { notValidatedGuard } from '../guards/not-validated.guard';
import { paperGuard } from '../guards/paper.guard';
import { validatedGuard } from '../guards/validated.guard';
import { paperResolver } from './resolvers/paper.resolver';
import { extraDataResolver } from './resolvers/extra-data.resolver';
import { submissionResolver } from './resolvers/submission.resolver';

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
    title: $localize`Validare`,
    data: { hideDrawer: true },
    canActivate: [notValidatedGuard]
  },
  {
    path: 'teachers',
    loadComponent: () => import('./pages/teachers-grid/teachers-grid.component').then(m => m.StudentTeachersGridComponent),
    title: $localize`Toți profesorii`,
    data: { mode: "all", hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'suggested-teachers',
    loadComponent: () => import('./pages/teachers-grid/teachers-grid.component').then(m => m.StudentTeachersGridComponent),
    title: $localize`Profesori sugerați`,
    data: { mode: "suggested", hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'applications',
    loadComponent: () => import('./pages/applications/applications.component').then(m => m.StudentApplicationsComponent),
    title: $localize`Cereri`,
    data: { hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'applications/:state',
    loadComponent: () => import('./pages/applications/applications.component').then(m => m.StudentApplicationsComponent),
    title: $localize`Cereri`,
    data: { hasPaper: false },
    canActivate: [validatedGuard, paperGuard]
  },
  {
    path: 'submission',
    loadComponent: () => import('./pages/my-submission/my-submission.component').then(m => m.MySubmissionComponent),
    title: $localize`Lucrare și dosar`,
    resolve: {
      submission: submissionResolver,
      paper: paperResolver,
      extraData: extraDataResolver,
    },
    canActivate: [validatedGuard, paperGuard]
  },
  { path: 'paper', redirectTo: 'submission', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
