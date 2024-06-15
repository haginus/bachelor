import { Routes } from '@angular/router';
import { NotSignedInGuard } from './guards/not-signed-in.guard';
import { SignedInGuard } from './guards/signed-in.guard';
import { RoleGuard } from './guards/role.guard';
import { Component } from '@angular/core';

@Component({ template: '' }) class RedirectTrap {}

export const routes: Routes = [
  {
    path: 'sign-up',
    loadComponent: () => import('./shared/components/sign-up/sign-up.component').then(m => m.SignUpComponent),
    data: { hideDrawer: true, hideToolbar: true, animate: false },
    canActivate: [NotSignedInGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/components/login/login.component').then(m => m.LoginComponent),
    data: { hideDrawer: true, hideToolbar: true, animate: false },
    canActivate: [NotSignedInGuard]
  },
  {
    path: 'login/token/:token',
    loadComponent: () => import('./shared/components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    data: { hideDrawer: true, hideToolbar: true, animate: false }
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [SignedInGuard, RoleGuard],
    data: { role: ['admin', 'secretary'] }
  },
  {
    path: 'teacher',
    loadChildren: () => import('./teacher/teacher.module').then(m => m.TeacherModule),
    canActivate: [SignedInGuard, RoleGuard],
    data: { role: 'teacher' }
  },
  {
    path: 'student',
    loadChildren: () => import('./student/student.module').then(m => m.StudentModule),
    canActivate: [SignedInGuard, RoleGuard],
    data: { role: 'student' }
  },
  { path: '**', component: RedirectTrap, canActivate: [SignedInGuard, RoleGuard] },
];
