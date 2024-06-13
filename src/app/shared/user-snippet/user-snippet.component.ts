import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserDataMin } from '../../services/auth.service';

@Component({
  selector: 'app-user-snippet',
  templateUrl: './user-snippet.component.html',
  styleUrls: ['./user-snippet.component.scss']
})
export class UserSnippetComponent {

  constructor() { }

  @Input() user: UserDataMin;

  makeLink(url: string) {
    if(url.startsWith('http')) {
      return url;
    }
    return '//' + url;
  }
}
