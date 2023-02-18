import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';
import { AdminComponent } from './admin.component';
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

const routes: Routes = [
  {
    path: '',
    component: AdminComponent
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
    canActivate: [RoleGuard],
    data: { title: 'Setări sesiune de examinare', role: 'admin' }
  },
  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [RoleGuard],
    data: { title: 'Rapoarte', role: 'admin' }
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
