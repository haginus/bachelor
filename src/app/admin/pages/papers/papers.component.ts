import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, merge, Observable, of, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { DOMAIN_TYPES, PAPER_TYPES, STUDY_FORMS } from 'src/app/lib/constants';
import { AdminService, GetPapersFilter } from 'src/app/services/admin.service';
import { Paper } from 'src/app/services/auth.service';
import { AreDocumentsUploaded, PaperDocumentEvent } from 'src/app/shared/paper-document-list/paper-document-list.component';
import { StudentDialogComponent } from '../../dialogs/new-student-dialog/student-dialog.component';
import { PaperValidationDialogComponent } from '../../dialogs/paper-validation-dialog/paper-validation-dialog.component';

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

  DOMAIN_TYPES = DOMAIN_TYPES;
  PAPER_TYPES = PAPER_TYPES;
  STUDY_FORMS = STUDY_FORMS;
  domains = this.admin.getDomains();
  showFilters: boolean = false;

  paperFilterForm = new FormGroup({
    validity: new FormControl(null),
    submitted: new FormControl(true),
    assigned: new FormControl(null),
    type: new FormControl(null),
    domainId: new FormControl(null),
    studyForm: new FormControl(null),
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
    if(filterForm.validity != null) {
      if(filterForm.validity == 'valid') {
        filter.isValid = true;
      }
      if(filterForm.validity == 'notValid') {
        filter.isValid = false;
      }
      if(filterForm.validity == 'nullValid') {
        filter.isValid = false;
        filter.isNotValid = false;
      }
    }
    if(filterForm.domainId != null) {
      filter.domainId = filterForm.domainId;
    }
    if(filterForm.studyForm != null) {
      filter.studyForm = filterForm.studyForm;
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
    let observable: Observable<boolean>;
    if(validate) {
      const dialog = this.dialog.open(PaperValidationDialogComponent);
      observable = dialog.afterClosed().pipe(
        switchMap(generalAverage => {
          if(generalAverage) {
            paper.isLoading = true;
            return this.admin.validatePaper(paper.id, true, generalAverage);
          }
          return of(false);
        })
      );
    } else {
      paper.isLoading = true;
      observable = this.admin.validatePaper(paper.id, false);
    }
    observable.subscribe(result => {
      if(result) {
        paper.isValid = validate;
        this.snackbar.open(validate ? "Lucrare validată" : "Lucrare invalidată" );
      }
      paper.isLoading = false;
    });
  }

  undoValidatePaper(paper: ExtendedPaper) {
    
    this.admin.undoValidatePaper(paper.id).subscribe(result => {
      if(result) {
        paper.isValid = null;
        this.snackbar.open("Validare anulată.");
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
