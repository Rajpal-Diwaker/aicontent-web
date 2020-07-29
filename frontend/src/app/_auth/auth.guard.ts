import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Router } from "@angular/router";
import { UserQueryService } from '../_services/user-query.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private userQueryService: UserQueryService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    if (this.userQueryService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}

