import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

const ROLE_MAP = {
  'student': 'student',
  'teacher': 'teacher',
  'admin': 'admin',
  'secretary': 'admin',
} as const;

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = Array.isArray(route.data['role']) ? route.data['role'] : [route.data['role']];
  const user = await firstValueFrom(authService.userData);
  if(!user) {
    return false;
  }
  const mappedRole = ROLE_MAP[user.type];
  if(!expectedRoles.includes(user.type)) {
    return router.createUrlTree([mappedRole]);
  }
  return true;
}
