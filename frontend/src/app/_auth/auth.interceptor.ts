import { HttpInterceptor, HttpRequest, HttpHandler, HttpHeaders } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Router } from "@angular/router";
import { UserQueryService } from '../_services/user-query.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private user: UserQueryService, private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        let authReq = req.clone({
            headers: new HttpHeaders({
              'Content-Type':  'application/json'
            })
          });

        if (req.headers.get('NoAuthOther'))
            return next.handle(req.clone(authReq))
        else {
            const token = this.user.isAuthenticated()
            const clonedreq = req.clone({
                headers: req.headers.set("token", token) 
            });

            return next.handle(clonedreq).pipe(
                tap(
                    event => { },
                    err => {
                        
                    }
                )
            );
        }
    }
}