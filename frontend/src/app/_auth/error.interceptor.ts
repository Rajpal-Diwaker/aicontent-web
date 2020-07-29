import { HttpEvent, 
    HttpInterceptor, 
    HttpHandler, 
    HttpRequest, 
    HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

constructor(){}
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
return next.handle(request)
          .pipe(
            catchError( (error: HttpErrorResponse) => {   
               var errMsg = '';

               if (error.error instanceof ErrorEvent) {		
                 errMsg = `${error.error.message}`;
               } 
               else {  // Server Side Error
                 errMsg = error && error.error && error.error.message? error.error.message: ""
                 if(!errMsg){
                    errMsg="Server not responding"
                 }
               }

               // return an observable
               return throwError(errMsg);
             })
          )
}
} 