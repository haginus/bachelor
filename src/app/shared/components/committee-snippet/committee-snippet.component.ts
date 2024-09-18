import { Component, computed, input, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Committee } from '../../../services/auth.service';

@Component({
  selector: 'app-committee-snippet',
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: './committee-snippet.component.html',
  styleUrl: './committee-snippet.component.scss'
})
export class CommitteeSnippetComponent {

  committee = input.required<Committee>();

  roles = {
    president: 'Președinte',
    secretary: 'Secretar',
    member: 'Membru',
  }

  sortedMembers = computed(() => (
    [...this.committee().members].sort((a, b) => {
      if(a.committeeMember?.role === 'president') {
        return -1;
      }
      if(a.committeeMember?.role === 'secretary') {
        return 1;
      }
      return 0;
    })
  ))

}
