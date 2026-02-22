import { Component, computed } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { isStudent } from '../../../lib/types';

@Component({
  selector: 'app-session-info',
  templateUrl: './session-info.component.html',
  styleUrls: ['./session-info.component.scss'],
  imports: [
    MatCardModule,
    MatListModule,
    DatePipe,
  ],
})
export class SessionInfoComponent {

  constructor(private auth: AuthService) { }

  user = toSignal(this.auth.userData);
  sessionSettings = toSignal(this.auth.sessionSettings);
  showWrittenExamInfo = computed(() => {
    const user = this.user();
    return this.sessionSettings().writtenExamDate && (!isStudent(user) || (user.specialization?.domain?.hasWrittenExam ?? true));
  });

}
