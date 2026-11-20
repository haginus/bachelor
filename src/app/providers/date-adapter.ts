import { Injectable, LOCALE_ID, Provider } from "@angular/core";
import { provideDateFnsAdapter } from "@angular/material-date-fns-adapter";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDatepickerIntl } from "@angular/material/datepicker";
import { enGB, ro } from 'date-fns/locale';

@Injectable()
export class MatDatepickerIntlRo extends MatDatepickerIntl {
  override calendarLabel = $localize`Calendar`;
  override openCalendarLabel = $localize`Deschideți calendarul`;
  override closeCalendarLabel = $localize`Închideți calendarul`;
  override switchToMonthViewLabel = $localize`Alegeți data`;
  override switchToMultiYearViewLabel = $localize`Alegeți luna și anul`;
  override startDateLabel = $localize`Data de început`;
  override endDateLabel = $localize`Data de sfârșit`;
  override comparisonDateLabel = $localize`Data de comparat`;

  override formatYearRangeLabel(start: string, end: string): string {
    return $localize`Din ${start}:start: până în ${end}:end:`;
  }
  override prevMonthLabel = $localize`Luna precedentă`;
  override nextMonthLabel = $localize`Luna următoare`;
  override prevYearLabel = $localize`Anul precedent`;
  override nextYearLabel = $localize`Anul următor`;
  override prevMultiYearLabel = $localize`24 de ani în urmă`;
  override nextMultiYearLabel = $localize`24 de ani înainte`;
}

export function provideAppDateAdapter(): Provider[] {
  return [
    { provide: MatDatepickerIntl, useClass: MatDatepickerIntlRo },
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (localeId: string) => {
        return localeId === 'en-GB' ? enGB : ro;
      },
      deps: [LOCALE_ID]
    },
    provideDateFnsAdapter()
  ];
}
