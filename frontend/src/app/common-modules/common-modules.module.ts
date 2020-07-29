import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { StriphtmlPipe } from '../_pipes/striphtml.pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [StriphtmlPipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    StriphtmlPipe
  ]
})
export class CommonModulesModule { }
