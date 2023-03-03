import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProgressToPercentPipe} from './pipes/progress-to-percent.pipe';

@NgModule({
  declarations: [ProgressToPercentPipe],
  exports: [ProgressToPercentPipe],
  imports: [CommonModule],
})
export class SharedModule {}
