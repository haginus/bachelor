import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Student } from '../lib/types';

export const paperGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const hasPaper = route.data['hasPaper'] == undefined ? true : route.data['hasPaper'];
  const user = await firstValueFrom(authService.userData);
  if(!user) {
    return false;
  }
  if(!!(user as Student).paper != hasPaper) {
    return router.createUrlTree([user.type]);
  }
  return true;
}
