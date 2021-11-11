import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserData, UserDataMin } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-snippet',
  templateUrl: './user-snippet.component.html',
  styleUrls: ['./user-snippet.component.scss']
})
export class UserSnippetComponent {

  constructor() { }

  @Input() user: UserDataMin;

}
