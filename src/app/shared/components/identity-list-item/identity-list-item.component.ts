import { Component, Input } from '@angular/core';
import { UserData } from '../../../services/auth.service';
import { MatRipple } from "@angular/material/core";
import { MatIcon } from '@angular/material/icon';
import { ApiUrlPipe } from '../../pipes/api-url';
import { getUserDescription } from '../../../lib/utils';

@Component({
  selector: 'app-identity-list-item',
  standalone: true,
  imports: [
    MatRipple,
    MatIcon,
    ApiUrlPipe,
  ],
  templateUrl: './identity-list-item.component.html',
  styleUrl: './identity-list-item.component.scss'
})
export class IdentityListItemComponent {

  @Input() user: UserData;

  getUserDescription = getUserDescription;
}
