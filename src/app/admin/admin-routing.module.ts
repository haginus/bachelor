import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDomainsComponent } from './pages/domains/domains.component';
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
  { path: 'session', component: SessionSettingsComponent, data: { title: 'Setări sesiune de asociere' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
