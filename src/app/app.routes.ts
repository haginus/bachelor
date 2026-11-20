import { Routes } from '@angular/router';
import { notSignedInGuard } from './guards/not-signed-in.guard';
import { signedInGuard } from './guards/signed-in.guard';
import { rolesGuard } from './guards/roles.guard';
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
    canActivate: [signedInGuard, rolesGuard(['admin', 'secretary'])],
  },
  {
    path: 'teacher',
    loadChildren: () => import('./teacher/teacher.module').then(m => m.TeacherModule),
    canActivate: [signedInGuard, rolesGuard('teacher')],
  },
  {
    path: 'student',
    loadChildren: () => import('./student/student.module').then(m => m.StudentModule),
    canActivate: [signedInGuard, rolesGuard('student')],
  },
  { path: '**', component: RedirectTrap, canActivate: [signedInGuard, rolesGuard([])] },
];
