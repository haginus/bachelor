import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TeacherService } from '../../../services/teacher.service';
import { Committee } from '../../../services/auth.service';
import { COMMITTEE_MEMBER_ROLE } from '../../../lib/constants';
import { MatCardModule } from '@angular/material/card';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PluckPipe } from '../../../shared/pipes/pluck.pipe';
import { JoinPipe } from '../../../shared/pipes/join.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'teacher-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
  standalone: true,
  imports: [
    FlexLayoutModule,
    MatCardModule,
    LoadingComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    PluckPipe,
    JoinPipe,
  ]
})
export class TeacherCommitteesComponent implements OnInit, OnDestroy {

  constructor(private teacher: TeacherService) { }

  committees: Committee[];
  isLoadingCommittees: boolean;
  subscription: Subscription;

  COMMITTEE_MEMBER_ROLE = COMMITTEE_MEMBER_ROLE;

  ngOnInit(): void {
    this.isLoadingCommittees = true;
    this.subscription = this.teacher.getCommittees().subscribe(committees => {
      this.committees = committees;
      this.isLoadingCommittees = false;
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
