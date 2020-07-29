
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { UserQueryService } from '../_services/user-query.service';

@Injectable()
export class RoleGuard implements CanActivate {


  constructor(private userQueryService: UserQueryService, private _router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const user = this.userQueryService.isAuthenticated();

    // if (user.roleid === next.data.role) {
    //   return true;
    // }

    this._router.navigate(['/404']);
    return false;
  }

}