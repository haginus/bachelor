import { Component, Input } from '@angular/core';
import { MatRipple } from "@angular/material/core";
import { MatIcon } from '@angular/material/icon';
import { ApiUrlPipe } from '../../pipes/api-url';
import { getUserDescription } from '../../../lib/utils';
import { User } from '../../../lib/types';

@Component({
  selector: 'app-identity-list-item',
  imports: [
    MatRipple,
    MatIcon,
    ApiUrlPipe,
  ],
  templateUrl: './identity-list-item.component.html',
  styleUrl: './identity-list-item.component.scss'
})
export class IdentityListItemComponent {

  @Input() user: User;

  getUserDescription = getUserDescription;
}
