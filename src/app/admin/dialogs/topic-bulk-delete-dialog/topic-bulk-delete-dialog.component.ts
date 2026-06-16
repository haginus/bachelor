import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TopicsService } from '../../../services/topics.service';
import { arrayMap, removeDiacritics } from '../../../lib/utils';
import { firstValueFrom, of } from 'rxjs';
import { Topic } from '../../../lib/types';
import { FilterableSelectConfig } from '../../../shared/components/filterable-select/filterable-select';

@Component({
  selector: 'app-topic-bulk-delete-dialog',
  templateUrl: './topic-bulk-delete-dialog.component.html',
  styleUrls: ['./topic-bulk-delete-dialog.component.scss'],
  standalone: false
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
  needsMove: boolean = false;

  topicSelectConfig: FilterableSelectConfig<Topic, number> = {
    clearable: true,
    limit: 100000,
    getOptions: (query) => {
      const prepareStr = (str: string) => removeDiacritics(str).toLowerCase();
      query.search = prepareStr(query.search);
      const rows = this.remainingTopics.filter(topic => prepareStr(topic.name).includes(query.search));
      return of({ rows, count: rows.length });
    },
    getSelectedOption: () => of(null!),
    getOptionLabel: (option) => option.name,
    getOptionValue: (option) => option.id,
  };

  deleteTopicForm = new FormGroup({
    "moveTo": new FormControl<number>(null, [Validators.required])
  });

  async ngOnInit() {
    try {
      this.needsMove = this.topicsToDelete.some(topic => topic.offerCount! > 0 || topic.studentCount! > 0 || topic.paperCount! > 0);
      if(!this.needsMove) return;
      const allTopics = await firstValueFrom(this.topicsService.findAll());
      const toDelete = arrayMap(this.topicsToDelete, (topic) => topic.id);
      this.remainingTopics = allTopics.filter(topic => !toDelete[topic.id]);
    } catch {
      this.remainingTopics = [];
    }
  }

  async deleteTopics() {
    const ids = this.topicsToDelete.map(topic => topic.id);
    const moveId = this.deleteTopicForm.get('moveTo').value ?? undefined;
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
