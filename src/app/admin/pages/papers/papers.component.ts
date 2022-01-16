import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { PAPER_TYPES } from 'src/app/lib/constants';
import { arrayMap } from 'src/app/lib/utils';
import { AdminService, GetPapersFilter } from 'src/app/services/admin.service';
import { Paper } from 'src/app/services/auth.service';
import { AreDocumentsUploaded, PaperDocumentEvent } from 'src/app/shared/paper-document-list/paper-document-list.component';
import { StudentDialogComponent } from '../../dialogs/new-student-dialog/student-dialog.component';

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
  data: ExtendedPaper[] = [];


  performedActions: BehaviorSubject<string> = new BehaviorSubject('');
  paperSubscription: Subscription;

  @ViewChild('table') table: MatTable<Paper>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  PAPER_TYPES = PAPER_TYPES;
  showFilters: boolean = false;

  paperFilterForm = new FormGroup({
    //validity: new FormControl(['valid', 'notValid', 'nullValid']),
    submitted: new FormControl(true),
    assigned: new FormControl(null),
    type: new FormControl(null)
  });

  ngOnInit() { }

  ngAfterViewInit(): void {
    const filterChanges = this.paperFilterForm.valueChanges;
    merge(this.sort.sortChange, filterChanges).subscribe(() => this.paginator.pageIndex = 0);

    this.paperSubscription = merge(this.sort.sortChange, this.paginator.page, filterChanges, this.performedActions).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        const filter = this.parseFilter();
        return this.admin.getPapers(this.sort.active, this.sort.direction.toUpperCase(),
          this.paginator.pageIndex, this.paginator.pageSize, filter);
      }),
    )
   .subscribe(papers => {
      this.data = papers.rows as ExtendedPaper[];
      this.resultsLength = papers.count;
      this.isLoadingResults = false;
    })
  }

  parseFilter(): GetPapersFilter {
    const filterForm = this.paperFilterForm.value;
    const filter: GetPapersFilter = {};
    if(filterForm.assigned != null) {
      filter.assigned = filterForm.assigned;
    }
    if(filterForm.submitted != null) {
      filter.submitted = filterForm.submitted;
    }
    if(filterForm.type != null) {
      filter.type = filterForm.type;
    }
    return filter;
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: ExtendedPaper) {
    paper.documentsUploaded = event.byUploader.student;
    // Detect changes so that the new value is reflected in the DOM
    this.cd.detectChanges();
  }

  validatePaper(paper: ExtendedPaper, validate: boolean) {
    paper.isLoading = true;
    this.admin.validatePaper(paper.id, validate).subscribe(result => {
      if(result) {
        paper.isValid = validate;
        this.snackbar.open(validate ? "Lucrare validată" : "Lucrare invalidată" );
      }
      paper.isLoading = false;
    })
  }

  openStudentDialog(id: number, event: any) {
    event.stopPropagation();
    this.dialog.open(StudentDialogComponent, {
      data: {
        userId: id,
        mode: 'view'
      }
    })
  }

  toggleFilters() {
    if(this.showFilters && this.paperFilterForm.dirty) {
      this.resetFilterForm();
    }
    this.showFilters = !this.showFilters;
  }

  resetFilterForm() {
    this.paperFilterForm.setValue({
      submitted: true,
      assigned: null,
      type: null
    });
  }

}

interface ExtendedPaper extends Paper {
  documentsUploaded: boolean;
  isLoading: boolean;
}
