import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { TextProgressSpinnerComponent } from '../text-progress-spinner/text-progress-spinner.component';

@Component({
  selector: 'app-progress-snack-bar',
  standalone: true,
  imports: [
    TextProgressSpinnerComponent,
  ],
  templateUrl: './progress-snack-bar.component.html',
  styleUrl: './progress-snack-bar.component.scss'
})
export class ProgressSnackBarComponent {

  public mode: 'determinate' | 'indeterminate';
  public title: string;
  public progress?: number;
  public suffix?: string;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ProgressSnackbarData,
  ) {
    this.mode = data?.mode ?? 'indeterminate';
    this.title = data?.title ?? 'Se încarcă...';
    this.progress = data?.progress ?? undefined;
    this.suffix = data?.suffix ?? '';
  }
}

export interface ProgressSnackbarData {
  mode?: 'determinate' | 'indeterminate';
  title?: string;
  progress?: number;
  suffix?: string;
}
