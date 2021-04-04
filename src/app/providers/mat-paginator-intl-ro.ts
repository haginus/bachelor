import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class MatPaginatorIntlRo extends MatPaginatorIntl {
  itemsPerPageLabel = 'Rezultate pe pagină:';
  nextPageLabel = 'Pagina următoare';
  previousPageLabel = 'Pagina anterioară';
  firstPageLabel = 'Prima pagină';
  lastPageLabel = 'Ultima pagină';

  getRangeLabel = function (page: number, pageSize: number, length: number) {
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