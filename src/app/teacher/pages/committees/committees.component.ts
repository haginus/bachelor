import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Committee } from 'src/app/services/auth.service';
import { TeacherService } from 'src/app/services/teacher.service';

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
