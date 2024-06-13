import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaperGuard implements CanActivate {
  constructor(private user: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const hasPaper = route.data['hasPaper'] == undefined ? true : route.data['hasPaper'];
    return this.user.userData.pipe(
      map(user => {
        if(user === undefined) {
          return false;
        }
        else if(!!user.student?.paper != hasPaper) {
          this.router.navigate([user.type]);
        }
        return true;
      })
    );
  }
}
