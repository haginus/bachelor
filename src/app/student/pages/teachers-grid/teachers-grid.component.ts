import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { GetTeacherOffersFilters, Offer, StudentService, TeacherOffers } from 'src/app/services/student.service';
import { Topic, TopicsService } from 'src/app/services/topics.service';
import { CommonDialogComponent } from 'src/app/shared/common-dialog/common-dialog.component';
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
        return settings.canApply();
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

  applyOffer(offer: Offer, skipDescription = false) {
    if(offer.description && !skipDescription) {
      const detailsRef = this.dialog.open(CommonDialogComponent, {
        data: {
          title: "Detalii ofertă",
          content: offer.description,
          actions: [
            {
              name: "Aplicați",
              value: true,
            }
          ]
        }
      });
      detailsRef.afterClosed().subscribe(result => {
        if(result) {
          this.applyOffer(offer, true);
        }
      });
      return;
    }
    const dialogRef = this.dialog.open(OfferApplicationSenderComponent, {
      data: offer.id
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        offer.hasApplied = true;
      }
    });
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
    this.teacherSubscription.unsubscribe();
  }

}
