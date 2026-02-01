import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-text-progress-spinner',
  standalone: true,
  imports: [
    MatProgressSpinner,
    DecimalPipe,
  ],
  templateUrl: './text-progress-spinner.component.html',
  styleUrl: './text-progress-spinner.component.scss'
})
export class TextProgressSpinnerComponent {

  @Input({ required: true }) mode: 'determinate' | 'indeterminate';
  @Input() value?: number;
  @Input() diameter: number = 32;
  @Input() color: string;
}
