import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { LayoutModule } from '../layout/layout.module';
import { ContactComponent } from './contact/contact.component';
import { CommonModulesModule } from '../common-modules/common-modules.module';
import { PriceListComponent } from './price-list/price-list.component';
import { HowWorksComponent } from './how-works/how-works.component';

@NgModule({
  declarations: [HomeComponent, ContactComponent, PriceListComponent, HowWorksComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    LayoutModule,
    CommonModulesModule
  ]
})
export class HomeModule { }
