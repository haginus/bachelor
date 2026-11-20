import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleGuard } from '../guards/role.guard';
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
import { teachersResolver } from './resolvers/teachers.resolver';
import { studentsResolver } from './resolvers/students.resolver';
import { papersResolver } from './resolvers/papers.resolver';
import { WrittenExamGradesComponent } from './pages/written-exam-grades/written-exam-grades.component';
import { submissionsResolver } from './resolvers/submissions.resolver';
import { submissionStatsResolver } from './resolvers/submissions-stats.resolver';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'students',
    component: AdminStudentsComponent,
    title: 'Studenți',
    resolve: {
      resolverData: studentsResolver,
    },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'teachers',
    component: AdminTeachersComponent,
    canActivate: [roleGuard],
    title: 'Profesori',
    data: { role: 'admin' },
    resolve: {
      resolverData: teachersResolver,
    },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'admins',
    component: AdminsComponent,
    canActivate: [roleGuard, sudoModeGuard],
    title: 'Administratori și secretari',
    data: { role: 'admin' }
  },
  {
    path: 'sign-up-requests',
    component: SignUpRequestsComponent,
    title: 'Cereri de înregistrare'
  },
  {
    path: 'domains',
    component: AdminDomainsComponent,
    canActivate: [roleGuard],
    title: 'Domenii',
    data: { role: 'admin' }
  },
  {
    path: 'topics',
    component: AdminTopicsComponent,
    canActivate: [roleGuard],
    title: 'Teme',
    data: { role: 'admin' }
  },
  {
    path: 'session',
    component: SessionSettingsComponent,
    canActivate: [roleGuard, sudoModeGuard],
    title: 'Setări sesiune de examinare',
    data: { role: 'admin' }
  },
  {
    path: 'reports',
    component: ReportsComponent,
    title: 'Rapoarte'
  },
  {
    path: 'papers',
    component: AdminPapersComponent,
    title: 'Lucrări',
    resolve: {
      resolverData: papersResolver,
    },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'committees',
    component: CommitteesComponent,
    title: 'Comisii'
  },
  {
    path: 'committees/:committeeId/assign-papers',
    component: PaperAssignComponent,
    canActivate: [roleGuard],
    title: 'Atribuire lucrări',
    data: { role: 'admin' }
  },
  {
    path: 'written-exam',
    component: WrittenExamGradesComponent,
    resolve: {
      resolverData: submissionsResolver,
      stats: submissionStatsResolver,
    },
    title: 'Note examen scris',
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'logs',
    loadComponent: () => import('./pages/logs/logs.component').then(m => m.LogsComponent),
    canActivate: [roleGuard],
    title: 'Loguri',
    data: { role: 'admin' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
