import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './_auth/auth.interceptor';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { HttpErrorInterceptor } from './_auth/error.interceptor';
import { PagenotfoundComponent } from './staticpages/pagenotfound/pagenotfound.component';
import { RefreshhomeComponent } from './staticpages/refreshhome/refreshhome.component';
import { AboutComponent } from './staticpages/about/about.component';
import { CookieService } from './_services/cookie.service';
import { NointernetComponent } from './staticpages/nointernet/nointernet.component';

@NgModule({
  declarations: [
    AppComponent,
    PagenotfoundComponent,
    RefreshhomeComponent,
    AboutComponent,
    NointernetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ScrollToModule.forRoot()
  ],
  providers: [CookieService, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
