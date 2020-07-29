import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagenotfoundComponent } from './staticpages/pagenotfound/pagenotfound.component';
import { AboutComponent } from './staticpages/about/about.component';
import { RefreshhomeComponent } from './staticpages/refreshhome/refreshhome.component';
import { AuthGuard } from './_auth/auth.guard';
import { NointernetComponent } from './staticpages/nointernet/nointernet.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomeModule'},
  { path: 'article', loadChildren: './article/article.module#ArticleModule'},
  { path: 'user', loadChildren: './user/user.module#UserModule'},
  { path: 'about', component: AboutComponent },
  { path: 'no-internet', component: NointernetComponent },
  { path: 'refreshhome', component: RefreshhomeComponent },
  { path: '**', component: PagenotfoundComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
