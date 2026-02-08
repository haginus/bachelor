import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const signedInGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if(!authService.isSignedIn()) {
    if(state.url && state.url != "/") {
      return router.createUrlTree(['login'], { queryParams: { next: state.url } });
    } else {
      return router.createUrlTree(['login']);
    }
  }
  return true;
}
