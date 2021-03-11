import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDomainsComponent } from './pages/domains/domains.component';
import { AdminStudentsComponent } from './pages/students/students.component';
import { AdminTeachersComponent } from './pages/teachers/teachers.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'students', component: AdminStudentsComponent },
  { path: 'teachers', component: AdminTeachersComponent },
  { path: 'domains', component: AdminDomainsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
