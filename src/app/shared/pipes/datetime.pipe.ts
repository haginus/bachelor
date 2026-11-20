import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datetime',
  standalone: true
})
export class DatetimePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: string | Date | null): string {
    if(!value) return '';
    return new Date(value).toLocaleDateString(this.locale, {
      timeZone: 'Europe/Bucharest',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

}
