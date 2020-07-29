import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { MenuComponent } from './menu/menu.component';
import { CommonModulesModule } from '../common-modules/common-modules.module';
import { FooterComponent } from './footer/footer.component';
import { ElementsModule } from '../elements/elements.module';
import { Ng5SliderModule } from 'ng5-slider';
import { UserqueryComponent } from './userquery/userquery.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [MenuComponent, FooterComponent, UserqueryComponent, HeaderComponent],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    CommonModulesModule,
    ElementsModule,
    Ng5SliderModule
  ],
  exports: [MenuComponent, FooterComponent, HeaderComponent]
})
export class LayoutModule { }
