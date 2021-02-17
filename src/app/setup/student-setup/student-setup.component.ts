import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Topic, TopicsService } from 'src/app/services/topics.service';
import { UserData, UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-student-setup',
  templateUrl: './student-setup.component.html',
  styleUrls: ['./student-setup.component.scss']
})
export class StudentSetupComponent implements OnInit, OnDestroy {

  constructor(private topicsService: TopicsService, private userService: UserService) { }

  userObservable: any;

  user!: UserData;

  ngOnInit(): void {
    this.userObservable = this.userService.getUserData().subscribe(user => {
      this.user = (user as UserData);
    });
  }

  validationForm = new FormGroup({
    'isValid': new FormControl(null, [Validators.requiredTrue])
  });

  topicsForm = new FormGroup({
    'selectedTopics': new FormControl(null, [Validators.required])
  });


  topics: Observable<Topic[]> = this.topicsService.getTopics();

  ngOnDestroy(): void {
    this.userObservable.unsubscribe();
  }
}