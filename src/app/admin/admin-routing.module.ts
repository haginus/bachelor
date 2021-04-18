import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { CommitteesComponent } from './pages/committees/committees.component';
import { AdminDomainsComponent } from './pages/domains/domains.component';
import { PaperAssignComponent } from './pages/paper-assign/paper-assign.component';
import { AdminPapersComponent } from './pages/papers/papers.component';
import { SessionSettingsComponent } from './pages/session-settings/session-settings.component';
import { AdminStudentsComponent } from './pages/students/students.component';
import { AdminTeachersComponent } from './pages/teachers/teachers.component';
import { AdminTopicsComponent } from './pages/topics/topics.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'students', component: AdminStudentsComponent },
  { path: 'teachers', component: AdminTeachersComponent },
  { path: 'domains', component: AdminDomainsComponent },
  { path: 'topics', component: AdminTopicsComponent },
  { path: 'session', component: SessionSettingsComponent, data: { title: 'Setări sesiune de asociere' } },
  { path: 'papers', component: AdminPapersComponent, data: { title: 'Lucrări' } },
  { path: 'committees', component: CommitteesComponent, data: { title: 'Comisii' } },
  { path: 'committees/:committeeId/assign-papers', component: PaperAssignComponent, data: { title: 'Atribuire lucrări' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
