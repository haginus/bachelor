import { Component, computed, input, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Committee } from '../../../services/auth.service';
import { DatetimePipe } from '../../pipes/datetime.pipe';
import { Paper } from '../../../lib/types';

@Component({
  selector: 'app-committee-snippet',
  standalone: true,
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
