import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { notValidatedGuard } from '../guards/not-validated.guard';
import { validatedGuard } from '../guards/validated.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [validatedGuard],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.component').then((m) => m.TeacherSetupComponent),
    title: $localize`Validare`,
    data: { hideDrawer: true },
    canActivate: [notValidatedGuard],
  },
  {
    path: 'offers',
    loadComponent: () => import('./pages/offers/offers.component').then((m) => m.TeacherOffersComponent),
    title: $localize`Ofertele dvs.`,
    canActivate: [validatedGuard],
  },
  {
    path: 'applications',
    loadComponent: () => import('./pages/applications/applications.component').then((m) => m.TeacherApplicationsComponent),
    title: $localize`Cereri`,
    canActivate: [validatedGuard],
  },
  {
    path: 'applications/:state',
    loadComponent: () => import('./pages/applications/applications.component').then((m) => m.TeacherApplicationsComponent),
    title: $localize`Cereri`,
    canActivate: [validatedGuard],
  },
  {
    path: 'applications/:state/:offerId',
    loadComponent: () => import('./pages/applications/applications.component').then((m) => m.TeacherApplicationsComponent),
    title: $localize`Cereri`,
    canActivate: [validatedGuard],
  },
  {
    path: 'papers',
    loadComponent: () => import('./pages/papers/papers.component').then((m) => m.TeacherPapersComponent),
    title: $localize`Lucrări`,
    canActivate: [validatedGuard],
  },
  {
    path: 'committees',
    loadComponent: () => import('./pages/committees/committees.component').then((m) => m.TeacherCommitteesComponent),
    title: $localize`Comisiile dvs.`,
    canActivate: [validatedGuard],
  },
  {
    path: 'committees/:id',
    loadComponent: () => import('./pages/committee-papers/committee-papers.component').then((m) => m.TeacherCommitteePapersComponent),
    canActivate: [validatedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherRoutingModule {}
