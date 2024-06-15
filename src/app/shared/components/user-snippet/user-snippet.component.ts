import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserDataMin } from '../../../services/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ApiUrlPipe } from '../../pipes/api-url';

@Component({
  selector: 'app-user-snippet',
  templateUrl: './user-snippet.component.html',
  styleUrls: ['./user-snippet.component.scss'],
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
    ApiUrlPipe,
  ]
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
