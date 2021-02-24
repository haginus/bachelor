import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotSignedInGuard } from './guards/not-signed-in.guard';
import { NotValidatedGuard } from './guards/not-validated.guard';
import { SignedInGuard } from './guards/signed-in.guard';
import { ValidatedGuard } from './guards/validated.guard';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChangePasswordComponent } from './user-components/change-password/change-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { hideDrawer: true, hideToolbar: true }, canActivate: [NotSignedInGuard] },
  { path: 'login/token/:token', component: ChangePasswordComponent, data: { hideDrawer: true, hideToolbar: true } },
  { path: 'dashboard', component: DashboardComponent, data: { title: "Dashboard" }, canActivate: [SignedInGuard, ValidatedGuard] },
  { path: '', pathMatch: "full", component: DashboardComponent, data: { title: "Dashboard" }, canActivate: [SignedInGuard, ValidatedGuard] },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule), canActivate: [SignedInGuard] },
  { path: 'teacher', loadChildren: () => import('./teacher/teacher.module').then(m => m.TeacherModule), canActivate: [SignedInGuard] },
  { path: 'student', loadChildren: () => import('./student/student.module').then(m => m.StudentModule), canActivate: [SignedInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
