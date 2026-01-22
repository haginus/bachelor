import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Topic, TopicsService } from '../../../services/topics.service';
import { arrayMap } from '../../../lib/utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-topic-bulk-delete-dialog',
  templateUrl: './topic-bulk-delete-dialog.component.html',
  styleUrls: ['./topic-bulk-delete-dialog.component.scss']
})
export class TopicBulkDeleteDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public topicsToDelete: Topic[],
    private topicsService: TopicsService,
    private dialogRef: MatDialogRef<TopicBulkDeleteDialogComponent>,
    private snackbar: MatSnackBar,
  ) {}

  remainingTopics: Topic[] = [];
  isLoading: boolean = false;

  deleteTopicForm = new FormGroup({
    "moveTo": new FormControl(null, [Validators.required])
  });

  async ngOnInit() {
    try {
      const allTopics = await firstValueFrom(this.topicsService.findAll());
      const toDelete = arrayMap(this.topicsToDelete, (topic) => topic.id);
      this.remainingTopics = allTopics.filter(topic => !toDelete[topic.id]);
    } catch {
      this.remainingTopics = [];
    }
  }

  async deleteTopics() {
    const ids = this.topicsToDelete.map(topic => topic.id);
    const moveId = this.deleteTopicForm.get('moveTo').value;
    this.isLoading = true;
    try {
      await firstValueFrom(this.topicsService.bulkDelete(ids, moveId));
      this.snackbar.open("Teme șterse.");
      this.dialogRef.close(true);
    } finally {
      this.isLoading = false;
    }
  }

}
