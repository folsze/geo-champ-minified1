import {GuessingMode} from './enums/guessing-mode';
import {SimpleChanges} from '@angular/core';

export const UTIL = {
  roundToXDigits: (value: number, digits: number): number => {
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
    return value;
  },

  maxProgress: 7,
  letUserRecognizeCorrectGuessMs: 200, /** Time to let the user recognize a correct guess */
  exitAnimationMs: 250,
  enterAnimationMs: 250,
  /**
   * https://stackoverflow.com/a/4591639/20009330
   */
  clone: <T>(obj: T): T => JSON.parse(JSON.stringify(obj)),

  /**
   *  ORDERING: area -> name -> number. Same order as in sidebar
   */
  modeIndex: (inputMode: GuessingMode, outputMode: GuessingMode): 0 | 1 | 2 | 3 | 4 | 5 => {
      if (outputMode === GuessingMode.area) {
        if (inputMode === GuessingMode.name) {
          return 0;
        } else if (inputMode === GuessingMode.number) {
          return 1;
        } else {
          throw new Error('Unregistered mode encountered');
        }
      } else if (outputMode === GuessingMode.name) {
        if (inputMode === GuessingMode.area) {
          return 2;
        } else if (inputMode === GuessingMode.number) {
          return 3;
        } else {
          throw new Error('Unregistered mode encountered');
        }
      } else if (outputMode === GuessingMode.number) {
        if (inputMode === GuessingMode.area) {
          return 4;
        } else if (inputMode === GuessingMode.name) {
          return 5;
        } else {
          throw new Error('Unregistered mode encountered');
        }
      } else {
        throw new Error('Unregistered mode encountered');
      }
  },
  debugNgOnChanges: (changes: SimpleChanges, props: string[]): void => {
    console.log('✅✅✅✅ ngOnChanges');
    let changesCount = 0;
    props.forEach(
      (prop) => {
        if (changes[prop] && changes[prop]?.currentValue !== undefined && changes[prop].currentValue   !== null) {
          console.log(prop + ': ' + changes[prop]?.previousValue + ' -> ' + changes[prop].currentValue);
          changesCount++;
        }
      }
    );
    console.log('⚠ RESULTING TOTAL # of changes: (' + changesCount + '/' + props.length + ')')
    console.log();
    console.log();
  },
};
