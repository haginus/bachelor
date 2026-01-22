import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { Topic, TopicsService } from '../../../services/topics.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-topic-dialog',
  templateUrl: './topic-dialog.component.html',
  styleUrls: ['./topic-dialog.component.scss']
})
export class AdminTopicDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TopicDialogData,
    private topics: TopicsService,
    private dialogRef: MatDialogRef<AdminTopicDialogComponent>,
    private snackbar: MatSnackBar,
  ) {}

  isLoading = false;
  remainingTopics = []

  editTopicForm = new FormGroup({
    "name": new FormControl(this.data.topic?.name, [Validators.required]),
  });

  deleteTopicForm = new FormGroup({
    "moveTo": new FormControl(null, [Validators.required])
  })

  async ngOnInit() {
    if(this.data.mode == 'delete') {
      const allTopics = await firstValueFrom(this.topics.findAll());
      this.remainingTopics = allTopics.filter(topic => topic.id != this.data.topic.id);
    }
  }

  get topicName() { return this.editTopicForm.get("name") }

  async addTopic() {
    const name = this.topicName.value;
    this.isLoading = true;
    try {
      await firstValueFrom(this.topics.create(name));
      this.dialogRef.close(true);
      this.snackbar.open("Temă salvată.");
    } finally {
      this.isLoading = false;
    }
  }

  async editTopic() {
    const name = this.topicName.value;
    const id = this.data.topic.id;
    this.isLoading = true;
    try {
      await firstValueFrom(this.topics.update(id, name));
      this.snackbar.open("Temă salvată.");
      this.dialogRef.close(true);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteTopic() {
    const id = this.data.topic.id;
    const moveId = this.deleteTopicForm.get('moveTo').value;
    this.isLoading = true;
    try {
      await firstValueFrom(this.topics.delete(id, moveId));
      this.snackbar.open("Temă ștearsă.");
      this.dialogRef.close(true);
    } finally {
      this.isLoading = false;
    }
  }

}

export interface TopicDialogData {
  mode: 'create' | 'edit' | 'delete',
  topic?: Topic;
}
