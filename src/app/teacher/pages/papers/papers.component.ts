import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BehaviorSubject, firstValueFrom, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddPaperComponent } from '../../dialogs/add-paper/add-paper.component';
import { AuthService, SessionSettings } from '../../../services/auth.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { inclusiveDate, parseDate } from '../../../lib/utils';
import { AreDocumentsUploaded, PaperDocumentEvent, PaperDocumentListComponent } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { EditPaperComponent } from '../../../shared/components/edit-paper/edit-paper.component';
import { CommonDialogComponent, CommonDialogData } from '../../../shared/components/common-dialog/common-dialog.component';
import { detailExpand, rowAnimation } from '../../../row-animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DecimalPipe, KeyValuePipe, TitleCasePipe } from '@angular/common';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PapersService } from '../../../services/papers.service';
import { PaperTitlePipe } from '../../../shared/pipes/paper-title.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Paper } from '../../../lib/types';

@Component({
  selector: 'app-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.scss'],
  animations: [
    rowAnimation,
    detailExpand,
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    UserSnippetComponent,
    PaperDocumentListComponent,
    TitleCasePipe,
    DecimalPipe,
    KeyValuePipe,
    PaperTitlePipe,
  ],
})
export class TeacherPapersComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  constructor(
    private readonly papersService: PapersService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private auth: AuthService,
  ) {}

  displayedColumns: string[] = [
    'status',
    'id',
    'title',
    'type',
    'student',
    'promotion',
    'committee',
  ];
  expandedPaper: Paper | null;
  resultsLength: number;
  isLoadingResults: boolean = true;
  sessionSettings!: SessionSettings;
  dataSource: MatTableDataSource<Paper>;

  showFilters = false;
  paperFilterForm = new FormGroup({
    submitted: new FormControl(null),
    type: new FormControl(null),
    promotion: new FormControl(null),
  });

  // Map to store whether paper needs attention.
  paperNeedsAttentionMap: PaperNeedsAttentionMap = {};

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');
  paperSubscription: Subscription;
  sessionSettingsSubscription: Subscription;
  canAddPapers: boolean = true;
  canUploadDocuments: boolean = false;

  @ViewChild('table') table: MatTable<Paper>;
  @ViewChild(MatSort) sort: MatSort;

  PAPER_TYPES = PAPER_TYPES;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.filterPredicate = this.getFilterFunction();
    this.paperSubscription = this.performedActions
      .pipe(
        switchMap((action) => {
          this.isLoadingResults = true;
          return this.papersService.findMineTeacher();
        })
      )
      .subscribe((papers) => {
        this.dataSource.data = papers;
        this.isLoadingResults = false;
      });

    this.paperFilterForm.valueChanges.subscribe(() => {
      this.dataSource.filter = JSON.stringify(this.paperFilterForm.value);
    });

    this.sessionSettingsSubscription = this.auth
      .getSessionSettings()
      .subscribe((settings) => {
        this.sessionSettings = settings;
        this.canAddPapers = settings.canApply();
        this.canUploadDocuments =
          Date.now() >= parseDate(settings.fileSubmissionStartDate).getTime() &&
          !settings.allowGrading;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (paper, property) => {
      switch (property) {
        case 'student':
          return paper.student.fullName;
        case 'promotion':
          return paper.student?.promotion;
        case 'committee':
          return paper.committee?.name;
        default:
          return paper[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  handleDocumentEvents(event: PaperDocumentEvent, paperId: number) {}

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: Paper) {
    this.paperNeedsAttentionMap[paper.id] = !event.byUploader.teacher;
    // Detect changes so that the new value is reflected it the DOM
    this.cd.detectChanges();
  }

  async addPaper() {
    const dialogRef = this.dialog.open(AddPaperComponent);
    if(await firstValueFrom(dialogRef.afterClosed()) ) {
      this.refreshResults();
    }
  }

  get canEditPapers(): boolean {
    const today = Date.now();
    const endDateSecretary = inclusiveDate(
      this.sessionSettings.fileSubmissionEndDate
    ).getTime();
    return today <= endDateSecretary;
  }

  async editPaper(paper: Paper) {
    const dialogRef = this.dialog.open<EditPaperComponent, Paper>(EditPaperComponent, {
      data: paper,
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if(result.result) {
      this.refreshResults();
      if (result.documentsGenerated) {
        this.snackbar.open(
          'Documente noi au fost generate în urma modificărilor. Cereți studentului să le semneze.',
          null,
          { duration: 10000 }
        );
      }
    }
  }

  async unsubmitPaper(paper: Paper) {
    let dialogRef = this.dialog.open<CommonDialogComponent, CommonDialogData, boolean>(CommonDialogComponent, {
      data: {
        title: 'Anulați înscrierea?',
        content: 'Sunteți sigur că doriți să anulați înscrierea?',
        actions: [
          { name: 'Înapoi', value: false },
          { name: 'Anulați înscrierea', value: true },
        ],
      },
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return;
    try {
      await firstValueFrom(this.papersService.unsubmitPaper(paper.id));
      this.refreshResults();
      this.snackbar.open('Înscrierea a fost anulată.');
    } catch {

    }
  }

  async removePaper(paper: Paper) {
    const dialogRef = this.dialog.open<CommonDialogComponent, CommonDialogData, boolean>(CommonDialogComponent, {
      data: {
        title: 'Rupeți asocierea?',
        content: `Sunteți sigur că doriți să rupeți asocierea cu ${paper.student.fullName}?\nStudentul va trebui să își găsească alt profesor.`,
        actions: [
          { name: 'Anulați', value: false },
          { name: 'Rupeți asocierea', value: true },
        ],
      },
    });
    if(!await firstValueFrom(dialogRef.afterClosed())) return;
    try {
      this.isLoadingResults = true;
      await firstValueFrom(this.papersService.delete(paper.id));
    } catch {
      return;
    } finally {
      this.isLoadingResults = false;
    }
    this.snackbar.open('Asociere ruptă.');
    this.refreshResults();
  }

  toggleFilters() {
    if (this.showFilters && this.paperFilterForm.dirty) {
      this.resetFilterForm();
    }
    this.showFilters = !this.showFilters;
  }

  resetFilterForm() {
    this.paperFilterForm.reset();
  }

  getFilterFunction() {
    return (paper: Paper, filter: string) => {
      const filterForm = JSON.parse(filter);
      let result = true;
      if (filterForm.submitted != null) {
        result = result && filterForm.submitted === !!paper.submissionId;
      }
      if (filterForm.type != null) {
        result = result && filterForm.type == paper.type;
      }
      if (filterForm.promotion != null) {
        result =
          result &&
          paper.student.promotion.startsWith(filterForm.promotion);
      }
      return result;
    };
  }

  async downloadExcel() {
    const teacherId = (await firstValueFrom(this.auth.userData)).id;
    this.papersService.saveXlsxExport({ teacherId });
  }

  ngOnDestroy(): void {
    this.paperSubscription.unsubscribe();
    this.sessionSettingsSubscription.unsubscribe();
  }
}

interface PaperNeedsAttentionMap {
  [name: number]: boolean;
}
