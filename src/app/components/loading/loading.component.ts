import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  constructor() { }

  @Input() color: 'primary' | 'accent' | 'warn' = 'accent';
  @Input() type: 'bar' | 'spinner' = 'bar';

  ngOnInit(): void {
  }

}
