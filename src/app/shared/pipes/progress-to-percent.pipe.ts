import { Pipe, PipeTransform } from '@angular/core';
import {UTIL} from '../../util';

@Pipe({
  name: 'progressToPercent'
})
export class ProgressToPercentPipe implements PipeTransform {

  transform(progress: number): unknown {
    return UTIL.roundToXDigits(progress * 100, 1);
  }

}

