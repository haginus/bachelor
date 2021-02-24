import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotValidatedGuard } from '../guards/not-validated.guard';
import { TeacherSetupComponent } from './pages/setup/setup.component';
import { TeacherComponent } from './teacher.component';

const routes: Routes = [
  { path: '', component: TeacherComponent },
  { path: 'setup', component: TeacherSetupComponent, data: { hideDrawer: true, title: "Validare" }, canActivate: [NotValidatedGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeacherRoutingModule { }
