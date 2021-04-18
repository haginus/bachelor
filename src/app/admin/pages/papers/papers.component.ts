import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { Paper } from 'src/app/services/auth.service';
import { AreDocumentsUploaded, PaperDocumentEvent } from 'src/app/shared/paper-document-list/paper-document-list.component';

@Component({
  selector: 'app-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdminPapersComponent implements OnInit, AfterViewInit {

  constructor(private admin: AdminService, private cd: ChangeDetectorRef, private dialog: MatDialog,
    private snackbar: MatSnackBar) { }

  displayedColumns: string[] = ['status', 'id', 'title', 'type', 'student', 'teacher', 'committee'];
  expandedPaper: Paper | null;
  resultsLength: number;
  isLoadingResults: boolean = true;
  data: Paper[] = [];


  performedActions: BehaviorSubject<string> = new BehaviorSubject('');
  paperSubscription: Subscription;

  @ViewChild('table') table: MatTable<Paper>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() { }

  ngAfterViewInit(): void {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    
    this.paperSubscription = merge(this.sort.sortChange, this.paginator.page, this.performedActions).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.admin.getPapers(this.sort.active, this.sort.direction.toUpperCase(),
          this.paginator.pageIndex, this.paginator.pageSize);
      }),
    )
   .subscribe(papers => {
      this.data = papers.rows;
      this.resultsLength = papers.count;
      this.isLoadingResults = false;
    })
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  handleDocumentEvents(event: PaperDocumentEvent, paperId: number) {

  }

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: Paper) {
    //this.paperNeedsAttentionMap[paper.id] = !event.byUploader.teacher;
    // Detect changes so that the new value is reflected it the DOM
    this.cd.detectChanges();
  }

}
