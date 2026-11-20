import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { countries } from '../../lib/countries';

@Pipe({ name: 'countryName' })
export class CountryNamePipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);
  private readonly names = new Intl.DisplayNames([this.locale], { type: 'region' });

  transform(value: string): string {
    if (this.locale !== 'en-GB' || !value) return value;
    const code = Object.entries(countries).find(([, name]) => name === value)?.[0];
    return code ? this.names.of(code) ?? value : value;
  }
}
