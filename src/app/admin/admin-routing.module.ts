import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';
import { AdminComponent } from './admin.component';
import { AdminsComponent } from './pages/admins/admins.component';
import { CommitteesComponent } from './pages/committees/committees.component';
import { AdminDomainsComponent } from './pages/domains/domains.component';
import { PaperAssignComponent } from './pages/paper-assign/paper-assign.component';
import { AdminPapersComponent } from './pages/papers/papers.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SessionSettingsComponent } from './pages/session-settings/session-settings.component';
import { SignUpRequestsComponent } from './pages/sign-up-requests/sign-up-requests.component';
import { AdminStudentsComponent } from './pages/students/students.component';
import { AdminTeachersComponent } from './pages/teachers/teachers.component';
import { AdminTopicsComponent } from './pages/topics/topics.component';
import { sudoModeGuard } from '../guards/sudo-mode.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'students',
    component: AdminStudentsComponent,
    data: { title: 'Studenți' }
  },
  {
    path: 'teachers',
    component: AdminTeachersComponent,
    canActivate: [RoleGuard],
    data: { title: 'Profesori', role: 'admin' }
  },
  {
    path: 'admins',
    component: AdminsComponent,
    canActivate: [RoleGuard, sudoModeGuard],
    data: { title: 'Administratori și secretari', role: 'admin' }
  },
  {
    path: 'sign-up-requests',
    component: SignUpRequestsComponent,
    data: { title: 'Cereri de înregistrare' }
  },
  {
    path: 'domains',
    component: AdminDomainsComponent,
    canActivate: [RoleGuard],
    data: { title: 'Domenii', role: 'admin' }
  },
  {
    path: 'topics',
    component: AdminTopicsComponent,
    canActivate: [RoleGuard],
    data: { title: 'Teme', role: 'admin' }
  },
  {
    path: 'session',
    component: SessionSettingsComponent,
    canActivate: [RoleGuard, sudoModeGuard],
    data: { title: 'Setări sesiune de examinare', role: 'admin' }
  },
  {
    path: 'reports',
    component: ReportsComponent,
    data: { title: 'Rapoarte' }
  },
  {
    path: 'papers',
    component: AdminPapersComponent,
    data: { title: 'Lucrări' }
  },
  {
    path: 'committees',
    component: CommitteesComponent,
    data: { title: 'Comisii' }
  },
  {
    path: 'committees/:committeeId/assign-papers',
    component: PaperAssignComponent,
    canActivate: [RoleGuard],
    data: { title: 'Atribuire lucrări', role: 'admin' }
  },
  {
    path: 'logs',
    loadComponent: () => import('./pages/logs/logs.component').then(m => m.LogsComponent),
    canActivate: [RoleGuard],
    data: { title: 'Loguri', role: 'admin' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
