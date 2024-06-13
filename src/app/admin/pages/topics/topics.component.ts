import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { TopicBulkDeleteDialogComponent } from '../../dialogs/topic-bulk-delete-dialog/topic-bulk-delete-dialog.component';
import { AdminTopicDialogComponent } from '../../dialogs/topic-dialog/topic-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { Topic } from '../../../services/topics.service';
import { Selectable } from '../../../lib/models/Selectable';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class AdminTopicsComponent implements OnInit, AfterViewInit {

  constructor(private admin: AdminService, private dialog: MatDialog) { }

  displayedColumns: string[] = ['id', 'name', 'actions'];
  resultsLength: number;
  isLoadingResults: boolean = true;
  isError: boolean = false;
  data: Topic[];
  topicsSelectable = new Selectable<Topic>((topic) => topic.id);
  selectableOpen: boolean = false;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.performedActions)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.admin.getTopics(
            this.sort.active, this.sort.direction.toUpperCase(), this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          this.isLoadingResults = false;
          this.resultsLength = data.count;
          this.topicsSelectable.setCurrentPage(data.rows);
          return data.rows;
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
      this.displayedColumns = ['id', 'name', 'actions'];
      this.topicsSelectable.reset();

    } else {
      this.displayedColumns = ['select', 'id', 'name', 'actions'];
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
