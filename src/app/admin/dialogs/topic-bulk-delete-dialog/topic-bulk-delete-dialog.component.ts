import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Topic, TopicsService } from '../../../services/topics.service';
import { AdminService } from '../../../services/admin.service';
import { arrayMap } from '../../../lib/utils';

@Component({
  selector: 'app-topic-bulk-delete-dialog',
  templateUrl: './topic-bulk-delete-dialog.component.html',
  styleUrls: ['./topic-bulk-delete-dialog.component.scss']
})
export class TopicBulkDeleteDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public topicsToDelete: Topic[], private admin: AdminService,
    private dialogRef: MatDialogRef<TopicBulkDeleteDialogComponent>, private snackbar: MatSnackBar,
    private topicsService: TopicsService) { }

  remainingTopics: Topic[] = [];
  isLoading: boolean = false;

  deleteTopicForm = new FormGroup({
    "moveTo": new FormControl(null, [Validators.required])
  });

  ngOnInit(): void {
    this.topicsService.getTopics().subscribe(topics => {
      const toDelete = arrayMap(this.topicsToDelete, (topic) => topic.id);
      this.remainingTopics = topics.filter(topic => !toDelete[topic.id]);
    });
  }


  deleteTopics() {
    const ids = this.topicsToDelete.map(topic => topic.id);
    const moveId = this.deleteTopicForm.get('moveTo').value;
    this.isLoading = true;
    this.admin.deleteTopics(ids, moveId).subscribe(res => {
      if(res) {
        this.snackbar.open("Teme șterse.");
        this.dialogRef.close(res);
      }
      this.isLoading = false;
    });
  }



}
