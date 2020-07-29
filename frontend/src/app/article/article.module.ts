import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review/review.component';
import { ArticleRoutingModule } from './article-routing.module';
import { MyarticlesComponent } from './myarticles/myarticles.component';
import { LayoutModule } from '../layout/layout.module';
import { ElementsModule } from '../elements/elements.module';
import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { CommonModulesModule } from '../common-modules/common-modules.module';

@NgModule({
  declarations: [ReviewComponent, MyarticlesComponent],
  imports: [
    CommonModule,
    ArticleRoutingModule,
    LayoutModule,
    ElementsModule,
    RichTextEditorAllModule,
    CommonModulesModule
  ]
})
export class ArticleModule { }
