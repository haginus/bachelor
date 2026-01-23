import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { OfferApplicationSenderComponent } from '../../dialogs/offer-application-sender/offer-application-sender.component';
import { Topic, TopicsService } from '../../../services/topics.service';
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
import { TeacherOffersService } from '../../../services/teacher-offers.service';
import { Offer, TeacherOfferDto } from '../../../lib/types';

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
    private topicsService: TopicsService,
    private readonly teacherOffersService: TeacherOffersService,
    private auth: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  mode: 'all' | 'suggested';
  topics: Topic[] = []
  topicSubscription: Subscription;

  teachers: TeacherOfferDto[] = [];
  teacherSubscription: Subscription;

  canApply: boolean = true; // If application session is in progress

  isLoadingTeachers: boolean = true;

  filterForm = new FormGroup({
    "onlyActive": new FormControl<boolean>(true),
    "topicIds": new FormControl<number[]>([]),
    "search": new FormControl<string | null>(null),
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

    this.topicSubscription = this.topicsService.findAll().subscribe(topics => {
      this.topics = topics;
      this.setAllTopics();
    });

    this.teacherSubscription = this.route.data.pipe(
      switchMap(data => {
        this.mode = data['mode'] ? data['mode'] : 'all';
        if(this.mode == 'suggested') {
          return this.teacherOffersService.findAll({ isSuggested: true });
        } else {
          return this.filterForm.valueChanges.pipe(
            debounceTime(500),
            switchMap(filterDto => {
              if(this.topics.length == filterDto.topicIds.length || filterDto.topicIds.length == 0) {
                filterDto.topicIds = null;
              }
              this.isLoadingTeachers = true;
              return this.teacherOffersService.findAll(filterDto);
            })
          )
        }
      }),
      catchError(() => {
        this.isLoadingTeachers = false;
        return of([]);
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
        // offer.hasApplied = true;
      }
    });
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
    this.teacherSubscription.unsubscribe();
  }

}
