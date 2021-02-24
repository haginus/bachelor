import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentSetupComponent } from './pages/setup/student-setup.component';
import { StudentComponent } from './student.component';

const routes: Routes = [
  { path: '', component: StudentComponent },
  { path: 'setup', component: StudentSetupComponent, data: { hideDrawer: true, title: "Validare" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
