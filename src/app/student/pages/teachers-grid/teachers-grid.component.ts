import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { GetTeacherOffersFilters, StudentService, TeacherOffers } from 'src/app/services/student.service';
import { Topic, TopicsService } from 'src/app/services/topics.service';
import { OfferApplicationSenderComponent } from '../../dialogs/offer-application-sender/offer-application-sender.component';

@Component({
  selector: 'student-teachers-grid',
  templateUrl: './teachers-grid.component.html',
  styleUrls: ['./teachers-grid.component.scss']
})
export class StundentTeachersGridComponent implements OnInit, OnDestroy {

  constructor(private topicService: TopicsService, private studentService: StudentService, private auth: AuthService,
    private dialog: MatDialog, private route: ActivatedRoute) { }

  mode: 'all' | 'suggested';
  topics: Topic[] = []
  topicSubscription: Subscription;

  teachers: TeacherOffers[] = []
  teacherSubscription: Subscription;

  canApply: boolean = true; // If application session is in progress

  isLoadingTeachers: boolean = true;

  filterForm = new FormGroup({
    "topicIds": new FormControl([]),
    "teacherName": new FormControl(null),
    "onlyFree": new FormControl(true)
  });

  get topicSelect() { return this.filterForm.get("topicIds") }
  get teacherName() { return this.filterForm.get("teacherName") }
  get onlyFree() { return this.filterForm.get("onlyFree") }

  // Topic Select Controls

  removeTopicSelection() {
    this.topicSelect.setValue([]);
  }

  setAllTopics() {
    const topicIds = this.topics.map(topic => topic.id);
    this.topicSelect.setValue(topicIds);
  }

  ngOnInit(): void {
    this.auth.sessionSettings.pipe(
      map(settings => {
        const today = new Date().getTime();
        const start = new Date(settings.fileSubmissionStartDate).getTime();
        const end = new Date(settings.fileSubmissionEndDate).getTime();
        return start <= today && today <= end;
      })
    ).subscribe(result => this.canApply = result);

    this.topicSubscription = this.topicService.getTopics().subscribe(topics => {
      this.topics = topics;
      this.setAllTopics();
    });

    this.teacherSubscription = this.route.data.pipe(
      switchMap(data => {
        this.mode = data.mode ? data.mode : 'all';
        if(this.mode == 'suggested') {
          return this.studentService.getSuggestedTeacherOffers();
        } else {
          return this.filterForm.valueChanges.pipe(
            debounceTime(500), // wait until user stops typing
            switchMap(result => {
              this.isLoadingTeachers = true;
              let filters: GetTeacherOffersFilters = result;
              if(this.topics.length == filters.topicIds.length || filters.topicIds.length == 0) {
                filters.topicIds = null;
              }
              if(filters.teacherName == '') {
                filters.teacherName = null;
              }
              return this.studentService.getTeacherOffers(filters);
            })
          )
        }
      })
    ).subscribe(teachers => {
      this.teachers = teachers;
      this.isLoadingTeachers = false;
    });
  }

  applyOffer(id: number) {
    const dialogRef = this.dialog.open(OfferApplicationSenderComponent, {
      data: id
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        let teacherIdx = this.teachers.findIndex(teacher => teacher.offers.findIndex(offer => offer.id == id) >= 0);
        if(teacherIdx >= 0) {
          let offerIdx = this.teachers[teacherIdx].offers.findIndex(offer => offer.id == id);
          this.teachers[teacherIdx].offers[offerIdx].hasApplied = true;
        }
      }
    })
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
    this.teacherSubscription.unsubscribe();
  }

}
