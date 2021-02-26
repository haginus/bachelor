import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentSetupComponent } from './pages/setup/student-setup.component';
import { StundentTeachersGridComponent } from './pages/teachers-grid/teachers-grid.component';
import { StudentComponent } from './student.component';

const routes: Routes = [
  { path: '', component: StudentComponent },
  { path: 'setup', component: StudentSetupComponent, data: { hideDrawer: true, title: "Validare" } },
  { path: 'teachers', component: StundentTeachersGridComponent, data: { title: "Toți profesorii", mode: "all" } },
  { path: 'suggested-teachers', component: StundentTeachersGridComponent, data: { title: "Profesori sugerați", mode: "suggested" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
