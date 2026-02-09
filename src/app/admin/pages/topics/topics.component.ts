import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { TopicBulkDeleteDialogComponent } from '../../dialogs/topic-bulk-delete-dialog/topic-bulk-delete-dialog.component';
import { AdminTopicDialogComponent } from '../../dialogs/topic-dialog/topic-dialog.component';
import { TopicsService } from '../../../services/topics.service';
import { Selectable } from '../../../lib/models/Selectable';
import { rowAnimation } from '../../../row-animations';
import { Topic } from '../../../lib/types';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  animations: [
    rowAnimation,
  ],
  standalone: false
})
export class AdminTopicsComponent implements OnInit, AfterViewInit {

  constructor(private topics: TopicsService, private dialog: MatDialog) { }

  private readonly defaultDisplayedColumns = ['id', 'name', 'offerCount', 'studentCount', 'paperCount', 'actions'];
  displayedColumns: string[] = [...this.defaultDisplayedColumns];
  resultsLength: number;
  isLoadingResults: boolean = true;
  isError: boolean = false;
  data: Topic[] = [];
  topicsSelectable = new Selectable<Topic>((topic) => topic.id);
  selectableOpen: boolean = false;

  @ViewChild(MatSort) sort: MatSort;

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    merge(this.sort.sortChange, this.performedActions)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.topics.findAll({
            sortBy: this.sort.active,
            sortDirection: this.sort.direction || undefined,
            detailed: true
          });
        }),
        map(data => {
          this.isLoadingResults = false;
          this.resultsLength = data.length;
          this.topicsSelectable.setCurrentPage(data);
          return data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.isError = true;
          this.topicsSelectable.setCurrentPage([]);
          return of([] as Topic[]);
        })
      ).subscribe(data => this.data = data);
  }

  addTopic() {
    let dialogRef = this.dialog.open(AdminTopicDialogComponent, {
      data: {
        mode: 'create',
      }
    });

    dialogRef.afterClosed().subscribe(topic => {
      if(topic) {
        this.performedActions.next('createTopic');
      }
    })
  }

  editTopic(id: number) {
    let dialogRef = this.dialog.open(AdminTopicDialogComponent, {
      data: {
        mode: 'edit',
        topic: this.data.find(topic => topic.id == id)
      }
    });

    dialogRef.afterClosed().subscribe(topic => {
      if(topic) {
        this.performedActions.next('editTopic');
      }
    });
  }

  deleteTopic(id: number) {
    const topic = this.data.find(topic => topic.id == id);
    let dialogRef = this.dialog.open(AdminTopicDialogComponent, {
      data: {
        mode: 'delete',
        topic
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next('deleteTopic');
        this.topicsSelectable.toggleItem(topic, false);
      }
    });
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  toggleSelectable() {
    if(this.selectableOpen) {
      this.displayedColumns = [...this.defaultDisplayedColumns];
      this.topicsSelectable.reset();
    } else {
      this.displayedColumns = ['select', ...this.defaultDisplayedColumns];
    }
    this.selectableOpen = !this.selectableOpen;
  }

  bulkDelete() {
    const dialogRef = this.dialog.open(TopicBulkDeleteDialogComponent, {
      data: this.topicsSelectable.selectedItems
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next('deleteTopic');
        this.toggleSelectable();
      }
    });
  }

}
