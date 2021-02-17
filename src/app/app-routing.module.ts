import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignedInGuard } from './guards/signed-in.guard';
import { LoginComponent } from './login/login.component';
import { StudentSetupComponent } from './setup/student-setup/student-setup.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { hideDrawer: true, hideToolbar: true } },
  { path: 'setup/student', component: StudentSetupComponent, data: { hideDrawer: true, title: "Validare" }, canActivate: [SignedInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
