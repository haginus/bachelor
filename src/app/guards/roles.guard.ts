import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserType } from '../lib/types';

const ROLE_MAP = {
  'student': 'student',
  'teacher': 'teacher',
  'admin': 'admin',
  'secretary': 'admin',
} as const;

export const rolesGuard: (allowedRoles: UserType | UserType[]) => CanActivateFn = (allowedRoles) => {
  const expectedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = await firstValueFrom(authService.userData);
    if(!user) {
      return false;
    }
    if(!expectedRoles.includes(user.type)) {
      return router.createUrlTree([ROLE_MAP[user.type]]);
    }
    return true;
  };
};
