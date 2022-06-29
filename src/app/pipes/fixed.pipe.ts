import { Pipe, PipeTransform } from '@angular/core';
import { toFixedTruncate } from '../lib/utils';

@Pipe({name: 'fixed'})
export class FixedPipePipe implements PipeTransform {
  transform(value: number, ...args: number[]): string {
    const digits = args[0] || 2;
    return toFixedTruncate(value, digits).toFixed(digits);
  }
}
