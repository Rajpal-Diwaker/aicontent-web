import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { TransactionComponent } from './transaction/transaction.component';
import { CnfrmPwdComponent } from './cnfrm-pwd/cnfrm-pwd.component';
import { AuthGuard } from '../_auth/auth.guard';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], component: ProfileComponent },
  { path: 'edit', canActivate: [AuthGuard], component: EditProfileComponent },
  { path: 'transaction', canActivate: [AuthGuard], component: TransactionComponent },
  { path: 'confirm', component: CnfrmPwdComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
