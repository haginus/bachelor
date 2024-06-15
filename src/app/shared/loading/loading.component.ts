import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatProgressBarModule,
    NgClass,
  ],
})
export class LoadingComponent implements OnInit {

  constructor() { }

  @Input() color: 'primary' | 'accent' | 'warn' = 'accent';
  @Input() type: 'bar' | 'spinner' = 'bar';

  ngOnInit(): void {
  }

}
