import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Topic, TopicsService } from 'src/app/services/topics.service';
import { UserData, UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-student-setup',
  templateUrl: './student-setup.component.html',
  styleUrls: ['./student-setup.component.scss']
})
export class StudentSetupComponent implements OnInit, OnDestroy {

  constructor(private topicsService: TopicsService, private userService: UserService, private router: Router) { }

  userObservable: any;
  loadingUser: boolean = true;
  loadingValidation: boolean = true;


  user!: UserData;

  ngOnInit(): void {
    this.userObservable = this.userService.getUserData().subscribe(user => {
      this.user = (user as UserData);
      if(!this.user.validated) {
        this.loadingUser = false;
      } else {
        this.router.navigate(['dashboard']);
      }
    });
  }

  validationForm = new FormGroup({
    'isValid': new FormControl(null, [Validators.requiredTrue])
  });

  topicsForm = new FormGroup({
    'selectedTopics': new FormControl(null, [Validators.required])
  });


  topics: Observable<Topic[]> = this.topicsService.getTopics();

  selectionChange(ev:StepperSelectionEvent) {
    if(ev.selectedIndex == 2) {
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
        this.router.navigate(['dashboard']);
      }
    })
  }

  ngOnDestroy(): void {
    this.userObservable.unsubscribe();
  }
}