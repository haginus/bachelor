import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService, UserData } from 'src/app/services/auth.service';
import { Topic, TopicsService } from 'src/app/services/topics.service';
import { FUNDING_FORMS, STUDY_FORMS } from 'src/app/lib/constants';
import { MatDialog } from '@angular/material/dialog';
import { ProblemReportComponent, ProblemReportDialogData } from 'src/app/components/problem-report/problem-report.component';

@Component({
  selector: 'student-setup',
  templateUrl: './student-setup.component.html',
  styleUrls: ['./student-setup.component.scss']
})
export class StudentSetupComponent implements OnInit, OnDestroy {

  constructor(private topicsService: TopicsService, private userService: AuthService, private router: Router,
    private dialog: MatDialog) { }

  userObservable: any;
  loadingUser: boolean = true;
  loadingValidation: boolean = true;


  user!: UserData;

  STUDY_FORMS = STUDY_FORMS;
  FUNDING_FORMS = FUNDING_FORMS;

  ngOnInit(): void {
    this.userObservable = this.userService.getUserData().subscribe(user => {
      this.user = (user as UserData);
      if(!this.user.validated) {
        this.loadingUser = false;
      } else {
        this.router.navigate(['student']);
      }
    });
  }

  validationForm = new FormGroup({
    'isValid': new FormControl(null, [Validators.requiredTrue]),
    'hasAgreed': new FormControl(null, [Validators.requiredTrue])
  });

  topicsForm = new FormGroup({
    'selectedTopics': new FormControl(null, [Validators.required])
  });


  topics: Observable<Topic[]> = this.topicsService.getTopics();

  selectionChange(ev:StepperSelectionEvent) {
    if(ev.selectedIndex == 3) {
      this.validateStudent();
    }
  }

  validateStudent() {
    this.loadingValidation = true;
    const topics = this.topicsForm.get("selectedTopics")?.value;
    this.userService.validateStudent(topics).subscribe(res => {
      if(!res) {
        this.loadingValidation = false;
      } else {
        this.router.navigate(['student']);
      }
    })
  }

  sendProblem(event: Event) {
    event.preventDefault();
    this.dialog.open<ProblemReportComponent, ProblemReportDialogData>(ProblemReportComponent, {
      data: {
        type: "data"
      }
    });
  }

  ngOnDestroy(): void {
    this.userObservable.unsubscribe();
  }
}