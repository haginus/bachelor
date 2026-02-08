import { Routes } from '@angular/router';
import { notSignedInGuard } from './guards/not-signed-in.guard';
import { signedInGuard } from './guards/signed-in.guard';
import { roleGuard } from './guards/role.guard';
import { Component } from '@angular/core';

@Component({ template: '' }) class RedirectTrap {}

export const routes: Routes = [
  {
    path: 'sign-up',
    loadComponent: () => import('./shared/components/sign-up/sign-up.component').then(m => m.SignUpComponent),
    data: { hideDrawer: true, hideToolbar: true, animate: false },
    canActivate: [notSignedInGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/components/login/login.component').then(m => m.LoginComponent),
    data: { hideDrawer: true, hideToolbar: true, animate: false },
    canActivate: [notSignedInGuard]
  },
  {
    path: 'login/token/:token',
    loadComponent: () => import('./shared/components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    data: { hideDrawer: true, hideToolbar: true, animate: false }
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [signedInGuard, roleGuard],
    data: { role: ['admin', 'secretary'] }
  },
  {
    path: 'teacher',
    loadChildren: () => import('./teacher/teacher.module').then(m => m.TeacherModule),
    canActivate: [signedInGuard, roleGuard],
    data: { role: 'teacher' }
  },
  {
    path: 'student',
    loadChildren: () => import('./student/student.module').then(m => m.StudentModule),
    canActivate: [signedInGuard, roleGuard],
    data: { role: 'student' }
  },
  { path: '**', component: RedirectTrap, canActivate: [signedInGuard, roleGuard] },
];
