import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

const ROLE_MAP = {
  'student': 'student',
  'teacher': 'teacher',
  'admin': 'admin',
  'secretary': 'admin',
} as const;

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const expectedRoles = Array.isArray(route.data.role) ? route.data.role : [route.data.role];
      return this.auth.userData.pipe(
        map(user => {
          const mappedRole = ROLE_MAP[user?.type];
          if(user === undefined) {
            return false;
          }
          else if(!expectedRoles.includes(user.type)) {
            this.router.navigate([mappedRole]);
          }
          return true;
        })
      );
  }
  
}
