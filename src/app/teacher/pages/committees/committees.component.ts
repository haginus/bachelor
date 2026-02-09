import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { COMMITTEE_MEMBER_ROLE } from '../../../lib/constants';
import { MatCardModule } from '@angular/material/card';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PluckPipe } from '../../../shared/pipes/pluck.pipe';
import { JoinPipe } from '../../../shared/pipes/join.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DatetimePipe } from '../../../shared/pipes/datetime.pipe';
import { CommitteesService } from '../../../services/committees.service';
import { Committee } from '../../../lib/types';

@Component({
  selector: 'teacher-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
  imports: [
    FlexLayoutModule,
    MatCardModule,
    LoadingComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    PluckPipe,
    JoinPipe,
    DatetimePipe,
  ]
})
export class TeacherCommitteesComponent implements OnInit, OnDestroy {

  constructor(private committeesService: CommitteesService) { }

  committees: Committee[];
  isLoadingCommittees: boolean;
  subscription: Subscription;

  COMMITTEE_MEMBER_ROLE = COMMITTEE_MEMBER_ROLE;

  ngOnInit(): void {
    this.isLoadingCommittees = true;
    this.subscription = this.committeesService.findMine().subscribe(committees => {
      this.committees = committees;
      this.isLoadingCommittees = false;
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
