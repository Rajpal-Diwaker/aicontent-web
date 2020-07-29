import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewComponent } from './review/review.component';
import { MyarticlesComponent } from './myarticles/myarticles.component';

const routes: Routes = [
  { path: '', component: MyarticlesComponent },
  { path: 'review', component: ReviewComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ArticleRoutingModule { }
