import { Component, computed, effect, input, output, signal, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import type { WorkBook } from 'xlsx';

@Component({
  selector: 'app-xlsx-viewer',
  imports: [
    MatButtonModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './xlsx-viewer.component.html',
  styleUrl: './xlsx-viewer.component.scss',
})
export class XlsxViewerComponent {

  file = input.required<File>();
  xlsxLib = signal<typeof import('xlsx') | null>(null);
  xlsxLoaded = output<void>();
  workbook = signal<WorkBook | null>(null);
  selectedSheet = signal<string | null>(null);

  selectedSheetHtml = computed(() => {
    const xlsx = this.xlsxLib();
    const sheetName = this.selectedSheet();
    if (!xlsx || !sheetName || !this.workbook()) {
      return '';
    }
    const sheet = this.workbook()!.Sheets[sheetName];
    return xlsx.utils.sheet_to_html(sheet).replace('SheetJS Table Export', '');
  });

  sheets = computed(() => {
    const workbook = this.workbook();
    if (!workbook) {
      return [];
    }
    return workbook.SheetNames;
  });

  constructor() {
    effect(() => {
      if (this.file()) {
        this.parseFile(this.file());
      }
    });
  }

  private async parseFile(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const xlsx = await import('xlsx');
    this.xlsxLib.set(xlsx);
    const workbook = xlsx.read(arrayBuffer, { type: 'array' });
    this.workbook.set(workbook);
    this.selectedSheet.set(workbook.SheetNames[0]);
    this.xlsxLoaded.emit();
  }

  protected selectSheet(sheetName: string) {
    this.selectedSheet.set(sheetName);
  }

}
