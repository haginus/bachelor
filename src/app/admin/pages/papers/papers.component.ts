import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, firstValueFrom, merge, Observable, of, Subscription } from 'rxjs';
import { debounceTime, startWith, switchMap } from 'rxjs/operators';
import { StudentDialogComponent } from '../../dialogs/new-student-dialog/student-dialog.component';
import { PaperValidationDialogComponent, PaperValidationDialogData } from '../../dialogs/paper-validation-dialog/paper-validation-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { DOMAIN_TYPES, PAPER_TYPES, STUDY_FORMS } from '../../../lib/constants';
import { AreDocumentsUploaded, DocumentMapElement } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { detailExpand, rowAnimation } from '../../../row-animations';
import { PaperQueryDto, PapersService } from '../../../services/papers.service';
import { EditPaperComponent } from '../../../shared/components/edit-paper/edit-paper.component';
import { RequestDocumentReuploadDialogComponent, RequestDocumentReuploadDialogData } from '../../dialogs/request-document-reupload-dialog/request-document-reupload-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Domain, Paper, PaperType } from '../../../lib/types';
import { DomainsService } from '../../../services/domains.service';

@Component({
  selector: 'app-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.scss'],
  animations: [
    rowAnimation,
    detailExpand,
  ],
})
export class AdminPapersComponent implements OnInit, AfterViewInit {

  constructor(
    private admin: AdminService,
    private readonly domainsService: DomainsService,
    private readonly papersService: PapersService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    this.paperFilterForm.get('domain')!.valueChanges.pipe(takeUntilDestroyed(), startWith(null)).subscribe((value) => {
      if(value) {
        this.paperFilterForm.get('specializationId')!.enable();
      } else {
        this.paperFilterForm.get('specializationId')!.disable();
      }
      this.paperFilterForm.get('specializationId')!.setValue(null);
    })
  }

  displayedColumns: string[] = ['status', 'id', 'title', 'type', 'student', 'teacher', 'committee'];
  expandedPaperId: string | null;
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
  domains = this.domainsService.findAll();

  showFilters: boolean = false;

  paperFilterForm = new FormGroup({
    validity: new FormControl<('valid' | 'invalid' | 'not_validated')>(null),
    submitted: new FormControl<boolean>(true),
    assigned: new FormControl<boolean>(null),
    type: new FormControl<PaperType>(null),
    domain: new FormControl<Domain>(null),
    specializationId: new FormControl<number>(null),
  });

  paperFilterDebouncedForm = new FormGroup({
    title: new FormControl<string>(null),
    studentName: new FormControl<string>(null),
  });

  ngOnInit() { }

  ngAfterViewInit(): void {
    const filterChanges = this.paperFilterForm.valueChanges;
    const filterDebouncedChanges = this.paperFilterDebouncedForm.valueChanges.pipe(debounceTime(500));
    merge(this.sort.sortChange, filterChanges).subscribe(() => this.paginator.pageIndex = 0);

    this.paperSubscription = merge(this.sort.sortChange, this.paginator.page, filterChanges, filterDebouncedChanges, this.performedActions).pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingResults = true;
        const filter = this.parseFilter();
        return this.papersService.findAll({
          sortBy: this.sort.active,
          sortDirection: this.sort.direction || 'asc',
          limit: this.paginator.pageSize,
          offset: this.paginator.pageIndex * this.paginator.pageSize,
          ...filter
        });
      }),
    )
   .subscribe(papers => {
      this.data = papers.rows as ExtendedPaper[];
      this.resultsLength = papers.count;
      this.isLoadingResults = false;
    });
  }

  parseFilter(): PaperQueryDto {
    const filterForm = this.paperFilterForm.value;
    const filterDebouncedForm = this.paperFilterDebouncedForm.value;
    return {
      ...filterForm,
      ...filterDebouncedForm,
      domainId: filterForm.domain ? filterForm.domain.id : null,
    }
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: ExtendedPaper) {
    paper.documentsUploaded = event.byUploader.student;
    // Detect changes so that the new value is reflected in the DOM
    this.cd.detectChanges();
  }

  async submitPaper(paper: ExtendedPaper, submit = true) {
    paper.isLoading = true;
    const action = submit
      ? this.papersService.submitPaper(paper.id)
      : this.papersService.unsubmitPaper(paper.id);
    const result = await firstValueFrom(action);
    paper.isLoading = false;
    if(result) {
      paper.submitted = submit;
      this.snackbar.open(submit ? 'Lucrare înscrisă.' : 'Înscriere anulată.');
    }
  }

  editPaper(paper: Paper) {
    const dialogRef = this.dialog.open<
      EditPaperComponent,
      Paper
    >(EditPaperComponent, {
      data: paper,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.result) {
        this.refreshResults();
        if (result.documentsGenerated) {
          this.snackbar.open(
            'Documente noi au fost generate în urma modificărilor. Cereți studentului să le semneze.',
            null,
            { duration: 10000 }
          );
        }
      }
    });
  }

  async handleReuploadRequestEvent(paper: Paper, event: { document: DocumentMapElement; reuploadRequested: boolean }) {
    if(event.reuploadRequested) {
      this.requestDocumentReupload(paper, event.document.requiredDocument.name);
    } else {
      const requestId = event.document.reuploadRequest!.id;
      const result = await firstValueFrom(this.admin.cancelDocumentReuploadRequest(paper.id, requestId));
      if(result) {
        this.snackbar.open('Solicitarea de reîncărcare a fost anulată.');
        this.refreshResults();
      }
    }
  }

  async requestDocumentReupload(paper: Paper, checkedDocument?: string) {
    const dialogRef = this.dialog.open(RequestDocumentReuploadDialogComponent, {
      data: {
        paperId: paper.id,
        requiredDocuments: paper.requiredDocuments.filter(doc => doc.uploadBy === 'student'),
        checkedDocuments: checkedDocument ? { [checkedDocument]: true } : null,
      } satisfies RequestDocumentReuploadDialogData
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if(result?.length) {
      this.refreshResults();
    }
  }

  validatePaper(paper: ExtendedPaper, validate: boolean) {
    let observable: Observable<boolean>;
    let generalAverage: number;
    if(validate) {
      const dialog = this.dialog.open<PaperValidationDialogComponent, PaperValidationDialogData>(PaperValidationDialogComponent, {
        data: {
          areDocumentsUploaded: paper.documentsUploaded,
          generalAverage: paper.student.generalAverage
        }
      });

      observable = dialog.afterClosed().pipe(
        switchMap(average => {
          if(average) {
            generalAverage = average;
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
        paper.student.generalAverage = generalAverage;
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

  async openStudentDialog(id: number, event: any) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(StudentDialogComponent, {
      data: {
        userId: id,
        mode: 'view'
      }
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if(result) {
      this.refreshResults();
    }
  }

  toggleFilters() {
    if(this.showFilters && this.paperFilterForm.dirty) {
      this.resetFilterForm();
    }
    this.showFilters = !this.showFilters;
  }

  resetFilterForm() {
    this.paperFilterForm.setValue({
      validity: null,
      submitted: true,
      assigned: null,
      type: null,
      domain: null,
      specializationId: null,
    });
    this.paperFilterDebouncedForm.setValue({
      title: null,
      studentName: null
    }, { emitEvent: false });
  }

}

interface ExtendedPaper extends Paper {
  documentsUploaded: boolean;
  isLoading: boolean;
}
