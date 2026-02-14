import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-pdf-viewer',
  imports: [
    NgxExtendedPdfViewerModule,
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfViewerComponent {

  protected readonly themeService = inject(ThemeService);

  @Input() src: NgxExtendedPdfViewerComponent['src'];
  @Output() pdfLoaded: NgxExtendedPdfViewerComponent['pdfLoaded'] = new EventEmitter();
  @Output() findbarVisibleChange: NgxExtendedPdfViewerComponent['findbarVisibleChange'] = new EventEmitter();
}
