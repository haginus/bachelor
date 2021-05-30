import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotSignedInGuard } from './guards/not-signed-in.guard';
import { SignedInGuard } from './guards/signed-in.guard';
import { LoginComponent } from './pages/login/login.component';
import { ChangePasswordComponent } from './user-components/change-password/change-password.component';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { path: 'login',
    component: LoginComponent,
    data: { hideDrawer: true, hideToolbar: true, animate: false },
    canActivate: [NotSignedInGuard]
  },
  { path: 'login/token/:token',
    component: ChangePasswordComponent,
    data: { hideDrawer: true, hideToolbar: true, animate: false }
  },
  { path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [SignedInGuard, RoleGuard],
    data: { role: 'admin' }
  },
  { path: 'teacher',
    loadChildren: () => import('./teacher/teacher.module').then(m => m.TeacherModule),
    canActivate: [SignedInGuard, RoleGuard],
    data: { role: 'teacher' }
  },
  { path: 'student',
    loadChildren: () => import('./student/student.module').then(m => m.StudentModule),
    canActivate: [SignedInGuard, RoleGuard],
    data: { role: 'student' }
  },
  { path: '**', redirectTo: '', canActivate: [SignedInGuard, RoleGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
