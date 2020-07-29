import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { TransactionComponent } from './transaction/transaction.component';
import { LayoutModule } from '../layout/layout.module';
import { CommonModulesModule } from '../common-modules/common-modules.module';
import { CnfrmPwdComponent } from './cnfrm-pwd/cnfrm-pwd.component';
import { ElementsModule } from '../elements/elements.module';

@NgModule({
  declarations: [ProfileComponent, EditProfileComponent, TransactionComponent, CnfrmPwdComponent],
  imports: [
    CommonModule,
    UserRoutingModule,
    LayoutModule,
    CommonModulesModule,
    ElementsModule
  ]
})
export class UserModule { }
