import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { Topic, TopicsService } from 'src/app/services/topics.service';

@Component({
  selector: 'app-topic-dialog',
  templateUrl: './topic-dialog.component.html',
  styleUrls: ['./topic-dialog.component.scss']
})
export class AdminTopicDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: TopicDialogData, private admin: AdminService,
    private dialogRef: MatDialogRef<AdminTopicDialogComponent>, private snackbar: MatSnackBar,
    private topicsService: TopicsService) { }

  isLoading = false;
  remainingTopics = []

  editTopicForm = new FormGroup({
    "name": new FormControl(this.data.topic?.name, [Validators.required]),
  });

  deleteTopicForm = new FormGroup({
    "moveTo": new FormControl(null, [Validators.required])
  })

  ngOnInit(): void {
    if(this.data.mode == 'delete') {
      let sub = this.topicsService.getTopics().pipe(
        map(topics => {
          let idx = topics.findIndex(topic => topic.id == this.data.topic.id);
          if(idx >= 0) {
            topics.splice(idx, 1);
          }
          return topics;
        })
      ).subscribe(topics => {
        this.remainingTopics = topics;
        sub.unsubscribe();
      });
    }
  }

  get topicName() { return this.editTopicForm.get("name") }

  addTopic() {
    const name = this.topicName.value;
    this.isLoading = true;
    this.admin.addTopic(name).subscribe(res => {
      if(res) {
        this.snackbar.open("Temă salvată.");
        this.dialogRef.close(res);
      } else {
        this.isLoading = false;
      }
    });
  }

  editTopic() {
    const name = this.topicName.value;
    const id = this.data.topic.id;
    this.isLoading = true;
    this.admin.editTopic(id, name).subscribe(res => {
      if(res) {
        this.snackbar.open("Temă salvată.");
        this.dialogRef.close(res);
      } else {
        this.isLoading = false;
      }
    });
  }

  deleteTopic() {
    const id = this.data.topic.id;
    const moveId = this.deleteTopicForm.get('moveTo').value;
    this.isLoading = true;
    this.admin.deleteTopic(id, moveId).subscribe(res => {
      if(res) {
        this.snackbar.open("Temă ștearsă.");
        this.dialogRef.close(res);
      }
      this.isLoading = false;
    });
  }

}

export interface TopicDialogData {
  mode: 'create' | 'edit' | 'delete',
  topic?: Topic
}
