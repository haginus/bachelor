import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlRo extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Rezultate pe pagină:';
  override nextPageLabel = 'Pagina următoare';
  override previousPageLabel = 'Pagina anterioară';
  override firstPageLabel = 'Prima pagină';
  override lastPageLabel = 'Ultima pagină';

  override getRangeLabel = function (page: number, pageSize: number, length: number) {
    if (length === 0 || pageSize === 0) {
      return '0 din ' + length;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    return (startIndex + 1) + ' - ' + endIndex + ' din ' + length;
  };

}
