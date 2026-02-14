import { Component, Input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ApiUrlPipe } from '../../pipes/api-url';
import { User } from '../../../lib/types';

@Component({
  selector: 'app-user-snippet',
  templateUrl: './user-snippet.component.html',
  styleUrls: ['./user-snippet.component.scss'],
  imports: [
    MatMenuModule,
    MatIconModule,
    ApiUrlPipe,
  ]
})
export class UserSnippetComponent {

  constructor() { }

  @Input() user: User;

  makeLink(url: string) {
    if(url.startsWith('http')) {
      return url;
    }
    return '//' + url;
  }
}
