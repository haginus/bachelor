import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { StudentService, TeacherOffers } from 'src/app/services/student.service';
import { Topic, TopicsService } from 'src/app/services/topics.service';

@Component({
  selector: 'student-teachers-grid',
  templateUrl: './teachers-grid.component.html',
  styleUrls: ['./teachers-grid.component.scss']
})
export class StundentTeachersGridComponent implements OnInit, OnDestroy {

  constructor(private topicService: TopicsService, private studentService: StudentService) { }

  topics: Topic[] = []
  topicSubscription: Subscription;

  teachers: TeacherOffers[] = []
  teacherSubscription: Subscription;

  filterForm = new FormGroup({
    "topics": new FormControl([]),
    "teacherName": new FormControl(null),
    "onlyFree": new FormControl(true)
  });

  get topicSelect() { return this.filterForm.get("topics") }

  // Topic Select Controls

  removeTopicSelection() {
    this.topicSelect.setValue([]);
  }

  setAllTopics() {
    const topicIds = this.topics.map(topic => topic.id);
    this.topicSelect.setValue(topicIds);
  }

  ngOnInit(): void {
    this.topicSubscription = this.topicService.getTopics().subscribe(topics => this.topics = topics);
    this.teacherSubscription = this.studentService.getTeacherOffers().subscribe(teachers => this.teachers = teachers);
  }

  ngOnDestroy() {
    this.topicSubscription.unsubscribe();
    this.teacherSubscription.unsubscribe();
  }

}
