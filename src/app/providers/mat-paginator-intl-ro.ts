import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlRo extends MatPaginatorIntl {
  override itemsPerPageLabel = $localize`Rezultate pe pagină:`;
  override nextPageLabel = $localize`Pagina următoare`;
  override previousPageLabel = $localize`Pagina anterioară`;
  override firstPageLabel = $localize`Prima pagină`;
  override lastPageLabel = $localize`Ultima pagină`;

  override getRangeLabel = function (page: number, pageSize: number, length: number) {
    if (length === 0 || pageSize === 0) {
      return $localize`0 din ${length}:total:`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return $localize`${startIndex + 1}:start: – ${endIndex}:end: din ${length}:total:`;
  };

}
