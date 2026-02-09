import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DatetimePipe } from '../../pipes/datetime.pipe';
import { Committee, Paper } from '../../../lib/types';

@Component({
  selector: 'app-committee-snippet',
  imports: [
    MatMenuModule,
    MatIconModule,
    DatetimePipe,
  ],
  templateUrl: './committee-snippet.component.html',
  styleUrl: './committee-snippet.component.scss'
})
export class CommitteeSnippetComponent {

  committee = input.required<Committee>();
  paper = input<Paper>();

  roles = {
    president: 'Președinte',
    secretary: 'Secretar',
    member: 'Membru',
  }

  sortedDays = computed(() => (
    [...this.committee().activityDays].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )));

}
