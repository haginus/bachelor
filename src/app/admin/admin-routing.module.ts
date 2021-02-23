import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminStudentsComponent } from './pages/students/students.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'students', component: AdminStudentsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
