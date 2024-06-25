import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [
    NgxExtendedPdfViewerModule,
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerComponent {

  @Input() src: NgxExtendedPdfViewerComponent['src'];
  @Output() pdfLoaded: NgxExtendedPdfViewerComponent['pdfLoaded'] = new EventEmitter();
  @Output() findbarVisibleChange: NgxExtendedPdfViewerComponent['findbarVisibleChange'] = new EventEmitter();
}
