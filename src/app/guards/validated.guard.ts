import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const validatedGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await firstValueFrom(authService.userData);
  if(!user) {
    return false;
  }
  if(!user.validated) {
    return router.createUrlTree([user.type, 'setup']);
  }
  return true;
}
