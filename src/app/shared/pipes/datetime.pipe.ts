import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datetime',
  standalone: true
})
export class DatetimePipe implements PipeTransform {

  transform(value: string | Date | null): string {
    if(!value) return '';
    return new Date(value).toLocaleDateString('ro-RO', {
      timeZone: 'Europe/Bucharest',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

}
