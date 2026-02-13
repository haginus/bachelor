import { afterNextRender, ChangeDetectorRef, Component, DestroyRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { firstValueFrom, merge, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { StudentDialogComponent } from '../../dialogs/new-student-dialog/student-dialog.component';
import { PaperValidationDialogComponent, PaperValidationDialogData } from '../../dialogs/paper-validation-dialog/paper-validation-dialog.component';
import { DOMAIN_TYPES, PAPER_TYPES, STUDY_FORMS } from '../../../lib/constants';
import { AreDocumentsUploaded, DocumentMapElement } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { detailExpand } from '../../../row-animations';
import { PaperQueryDto, PapersService } from '../../../services/papers.service';
import { EditPaperComponent } from '../../../shared/components/edit-paper/edit-paper.component';
import { RequestDocumentReuploadDialogComponent, RequestDocumentReuploadDialogData } from '../../dialogs/request-document-reupload-dialog/request-document-reupload-dialog.component';
import { Paper, PaperType } from '../../../lib/types';
import { DomainsService } from '../../../services/domains.service';
import { DocumentReuploadRequestsService } from '../../../services/document-reupload-requests.service';
import { PaginatedResolverResult } from '../../../lib/resolver-factory';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { removeEmptyProperties } from '../../../lib/utils';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.scss'],
  animations: [
    detailExpand,
  ],
  standalone: false
})
export class AdminPapersComponent {

  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly domainsService: DomainsService,
    private readonly papersService: PapersService,
    private readonly documentReuploadRequestsService: DocumentReuploadRequestsService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    this.route.data.pipe(takeUntilDestroyed()).subscribe(data => {
      this.resolverData = data['resolverData'];
    });
    afterNextRender(() => {
      this.paperFilterForm.patchValue(this.resolverData.params, { emitEvent: false });
      this.paperFilterDebouncedForm.patchValue(this.resolverData.params, { emitEvent: false });
      const filterValue = this.getFilterValue();
      if(filterValue.domainId) {
        this.paperFilterForm.get("specializationId").enable();
      } else {
        this.paperFilterForm.get("specializationId").disable();
      }
      if(JSON.stringify(removeEmptyProperties(filterValue)) !== JSON.stringify({ submitted: true })) {
        this.showFilters = true;
        this.cd.detectChanges();
      }
      this.performedActions.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        const filterValue = this.getFilterValue();
        this.router.navigate([], {
          relativeTo: this.route,
          replaceUrl: true,
          onSameUrlNavigation: 'reload',
          queryParams: {
            page: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDirection: this.sort.direction,
            ...removeEmptyProperties(filterValue),
          },
        });
      });

      const filterValueChanges = merge(
        this.paperFilterForm.valueChanges,
        this.paperFilterDebouncedForm.valueChanges.pipe(debounceTime(500)),
      );

      merge(filterValueChanges, this.sort.sortChange).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.paginator.pageIndex = 0;
      });

      merge(
        filterValueChanges,
        this.sort.sortChange,
        this.paginator.page,
      ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.performedActions.next("refresh");
      });
    });
  }

  resolverData!: PaginatedResolverResult<ExtendedPaper, PaperQueryDto>;
  displayedColumns: string[] = ['status', 'id', 'title', 'type', 'student', 'teacher', 'committee'];
  expandedPaperId: string | null;

  performedActions: Subject<string> = new Subject();
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
    validity: new FormControl<PaperQueryDto['validity']>(null),
    submitted: new FormControl<boolean>(true),
    assigned: new FormControl<boolean>(null),
    type: new FormControl<PaperType>(null),
    domainId: new FormControl<number>(null),
    specializationId: new FormControl<number>(null),
  });

  paperFilterDebouncedForm = new FormGroup({
    title: new FormControl<string>(null),
    studentName: new FormControl<string>(null),
  });

  getFilterValue(): PaperQueryDto {
    const filterForm = this.paperFilterForm.value;
    const filterDebouncedForm = this.paperFilterDebouncedForm.value;
    return {
      ...filterForm,
      ...filterDebouncedForm,
    };
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
    try {
      const { submission, submissionId } = await firstValueFrom(action);
      paper.submission = submission;
      paper.submissionId = submissionId;
      this.snackbar.open(submit ? 'Studentul a fost înscris în această sesiune.' : 'Studentul a fost retras din această sesiune.');
    } finally {
      paper.isLoading = false;
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
      await firstValueFrom(this.documentReuploadRequestsService.cancel(requestId));
      this.snackbar.open('Solicitarea de reîncărcare a fost anulată.');
      this.refreshResults();
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

  async validatePaper(paper: ExtendedPaper, validate: boolean) {
    let generalAverage: number;
    if(validate) {
      const dialog = this.dialog.open<PaperValidationDialogComponent, PaperValidationDialogData>(PaperValidationDialogComponent, {
        data: {
          areDocumentsUploaded: paper.documentsUploaded,
          generalAverage: paper.student.generalAverage
        }
      });
      generalAverage = await firstValueFrom(dialog.afterClosed());
      if(!generalAverage) return;
    }
    paper.isLoading = true;
    try {
      await firstValueFrom(
        this.papersService.validate(paper.id, { isValid: validate, generalAverage, ignoreRequiredDocuments: true })
      );
      paper.isValid = validate;
      if(!validate) {
        paper.committee = null;
      } else {
        paper.student.generalAverage = generalAverage;
      }
      this.snackbar.open(validate ? "Lucrare validată" : "Lucrare invalidată" );
    } finally {
      paper.isLoading = false;
    }
  }

  async undoValidatePaper(paper: ExtendedPaper) {
    paper.isLoading = true;
    try {
      await firstValueFrom(this.papersService.undoValidation(paper.id));
      paper.isValid = null;
      this.snackbar.open("Validare anulată.");
    } finally {
      paper.isLoading = false;
    }
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
    if(this.showFilters) {
      this.resetFilterForm();
    }
    this.showFilters = !this.showFilters;
  }

  resetFilterForm() {
    this.paperFilterForm.reset({ submitted: true });
    this.paperFilterDebouncedForm.reset();
  }

}

interface ExtendedPaper extends Paper {
  documentsUploaded: boolean;
  isLoading: boolean;
}
