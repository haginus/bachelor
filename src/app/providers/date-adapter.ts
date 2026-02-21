import { LOCALE_ID, Provider } from "@angular/core";
import { provideDateFnsAdapter } from "@angular/material-date-fns-adapter";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerIntl } from "@angular/material/datepicker";
import { ro } from 'date-fns/locale';

export class MatDatepickerIntlRo extends MatDatepickerIntl {
  override prevMonthLabel = 'Luna precedentă';
  override nextMonthLabel = 'Luna următoare';
  override prevYearLabel = 'Anul precedent';
  override nextYearLabel = 'Anul următor';
  override prevMultiYearLabel = '24 de ani în urmă';
  override nextMultiYearLabel = '24 de ani înainte';
}

export function provideAppDateAdapter(): Provider[] {
  return [
    { provide: MatDatepickerIntl, useClass: MatDatepickerIntlRo },
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (localeId: string) => {
        return ro;
      },
      deps: [LOCALE_ID]
    },
    provideDateFnsAdapter()
  ];
}
