import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TeacherService } from '../../../services/teacher.service';
import { Committee } from '../../../services/auth.service';

@Component({
  selector: 'teacher-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss']
})
export class TeacherCommitteesComponent implements OnInit, OnDestroy {

  constructor(private teacher: TeacherService) { }

  committees: Committee[];
  isLoadingCommittees: boolean;
  subscription: Subscription;

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
