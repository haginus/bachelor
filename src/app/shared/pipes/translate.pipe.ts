import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { TranslatableString } from '../../lib/types';

@Pipe({ name: 'translate', standalone: true })
export class TranslatePipe implements PipeTransform {
  private readonly language = inject(LOCALE_ID).toLowerCase().split(/[-_]/)[0] === 'en' ? 'en' : 'ro';

  transform(value: TranslatableString | null | undefined): string {
    return value?.[this.language] ?? value?.ro ?? '';
  }
}
