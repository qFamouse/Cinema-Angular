import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { take } from 'rxjs/operators';
import { UserService } from "./index";

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    this.userService.isAuthenticated
      .subscribe(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigateByUrl('/register');
        }
      })
    return this.userService.isAuthenticated.pipe(take(1));
  }
}
