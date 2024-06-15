import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { OfferApplicationSenderComponent } from '../../dialogs/offer-application-sender/offer-application-sender.component';
import { Topic, TopicsService } from '../../../services/topics.service';
import { GetTeacherOffersFilters, Offer, StudentService, TeacherOffers } from '../../../services/student.service';
import { AuthService } from '../../../services/auth.service';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';

@Component({
  selector: 'student-teachers-grid',
  templateUrl: './teachers-grid.component.html',
  styleUrls: ['./teachers-grid.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
    UserSnippetComponent,
  ],
})
export class StudentTeachersGridComponent implements OnInit, OnDestroy {

  constructor(
    private topicService: TopicsService,
    private studentService: StudentService,
    private auth: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

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
        this.mode = data['mode'] ? data['mode'] : 'all';
        if(this.mode == 'suggested') {
          return this.studentService.getSuggestedTeacherOffers();
        } else {
          return this.filterForm.valueChanges.pipe(
            debounceTime(500), // wait until user stops typing
            switchMap(result => {
              this.isLoadingTeachers = true;
              let filters = result as GetTeacherOffersFilters;
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
