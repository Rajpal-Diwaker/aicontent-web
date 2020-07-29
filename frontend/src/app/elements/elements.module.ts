import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ProgressBarModule } from "angular-progress-bar";
import { NoRecordFoundComponent } from './no-record-found/no-record-found.component';

@NgModule({
  declarations: [ProgressBarComponent, NoRecordFoundComponent],
  imports: [
    CommonModule,
    ProgressBarModule
  ],
  exports: [
    ProgressBarComponent,
    NoRecordFoundComponent
  ]
})
export class ElementsModule { }
