import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, combineLatest, firstValueFrom, merge, Subscription } from 'rxjs';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GradePaperComponent } from '../../dialogs/grade-paper/grade-paper.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AuthService, UserData } from '../../../services/auth.service';
import { CommitteeDocument, CommitteeDocumentsFormat, DocumentService } from '../../../services/document.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { AreDocumentsUploaded, PaperDocumentListComponent } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { detailExpand, rowAnimation } from '../../../row-animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';
import { PaperGradeTableComponent } from '../../../shared/components/paper-grade-table/paper-grade-table.component';
import { TitleCasePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PaperTitlePipe } from '../../../shared/pipes/paper-title.pipe';
import { PaperSchedulerNoticeComponent } from '../../../shared/components/paper-scheduler-notice/paper-scheduler-notice.component';
import { CommitteeSnippetComponent } from '../../../shared/components/committee-snippet/committee-snippet.component';
import { DatetimePipe } from '../../../shared/pipes/datetime.pipe';
import { LoaderService } from '../../../services/loader.service';
import { CommitteeFile, CommitteeFilesFormat, CommitteesService } from '../../../services/committees.service';
import { Committee, CommitteeMember, Paper } from '../../../lib/types';

@Component({
  selector: 'app-committee-papers',
  templateUrl: './committee-papers.component.html',
  styleUrls: ['./committee-papers.component.scss'],
  animations: [
    rowAnimation,
    detailExpand,
  ],
  standalone: true,
  imports: [
    FlexLayoutModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    UserSnippetComponent,
    PaperGradeTableComponent,
    PaperDocumentListComponent,
    PaperSchedulerNoticeComponent,
    CommitteeSnippetComponent,
    TitleCasePipe,
    PaperTitlePipe,
    DatetimePipe,
  ],
})
export class TeacherCommitteePapersComponent implements OnInit, AfterViewInit {
  constructor(
    private readonly committeesService: CommitteesService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private dialog: MatDialog,
    private documentService: DocumentService,
    private snackbar: MatSnackBar,
    private loader: LoaderService,
  ) {}

  displayedColumns: string[] = [
    'status',
    'id',
    'title',
    'type',
    'student',
    'teacher',
    'scheduledGrading'
  ];
  expandedPaper: Paper | null;
  resultsLength: number;
  isLoadingResults: boolean = true;
  dataSource: MatTableDataSource<Paper>;
  committee: Committee;
  gradingAllowed: boolean = false;
  user: UserData;
  hasGenerationRights: boolean = false;
  member!: CommitteeMember;
  showScheduleNotice = false;

  // Map to store whether paper needs attention.
  paperNeedsAttentionMap: PaperNeedsAttentionMap = {};

  paperSubscription: Subscription;
  performedActions: BehaviorSubject<string> = new BehaviorSubject('');

  PAPER_TYPES = PAPER_TYPES;

  @ViewChild('table') table: MatTable<Paper>;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([]);
    this.paperSubscription = combineLatest([
      this.route.params,
      this.auth.getSessionSettings(),
      this.auth.getUserData(),
      this.performedActions,
    ])
      .pipe(
        switchMap(([params, settings, userData]) => {
          this.gradingAllowed = settings.allowGrading;
          this.user = userData;
          this.isLoadingResults = true;
          return this.committeesService.findOne(+params['id']);
        })
      )
      .subscribe((committee) => {
        if (committee == null) {
          this.router.navigate(['teacher', 'committees']);
        } else {
          this.committee = committee;
          this.dataSource.data = committee.papers;
          this.isLoadingResults = false;
          // Check if user has rights to generate committee documents
          this.member = this.committee.members.find(
            (member) => member.teacherId == this.user.id
          );
          this.hasGenerationRights = ['president', 'secretary'].includes(
            this.member.role
          );
          this.updateScheduleNotice();
        }
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (paper, property) => {
      switch (property) {
        case 'student':
          return paper.student.fullName;
        case 'teacher':
          return paper.teacher.fullName;
        default:
          return paper[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  updateScheduleNotice() {
    this.showScheduleNotice =
      !this.committee.finalGrades &&
      this.hasGenerationRights &&
      this.committee.activityDays.length > 0 &&
      (
        !this.committee.publicScheduling ||
        this.committee.papers.some(paper => !paper.scheduledGrading)
      );
  }

  async schedulePapers() {
    try {
      const [{ PaperSchedulerComponent }] = await this.loader.loadResources(
        [import('../../../shared/components/paper-scheduler/paper-scheduler.component')]
      );
      const dialogRef = this.dialog.open(PaperSchedulerComponent, {
        data: this.committee,
        width: '95vw',
        maxWidth: '95vw'
      });
      await firstValueFrom(dialogRef.afterClosed());
      this.updateScheduleNotice();
      this.dataSource.data = this.committee.papers;
      this.cd.detectChanges();
    } catch {}
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: Paper) {
    if (this._checkPaperGraded(paper)) {
      this.paperNeedsAttentionMap[paper.id] = null;
    } else if (!event.byUploader.committee) {
      this.paperNeedsAttentionMap[paper.id] = 'needsDocUpload';
    } else {
      this.paperNeedsAttentionMap[paper.id] = 'needsGrade';
    }
    // Detect changes so that the new value is reflected it the DOM
    this.cd.detectChanges();
  }

  private _checkPaperGraded(paper: Paper): boolean {
    // Return true if user is secretary (they don't need to grade)
    if (this.member.role == 'secretary') {
      return true;
    }
    // Return true if teacher has a grade given to this paper
    return (
      paper.grades.findIndex(
        (grade) => grade.committeeMemberTeacherId == this.user.id
      ) >= 0
    );
  }

  async gradePaper(paper: Paper) {
    const dialogRef = this.dialog.open(GradePaperComponent, {
      data: paper,
      maxWidth: '500px',
      width: '90vw',
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if(!result) return;
    const { forPaper, forPresentation } = result;
    this.paperNeedsAttentionMap[paper.id] = 'loading';
    try {
      await firstValueFrom(
        this.committeesService.gradePaper({
          paperId: paper.id,
          committeeId: this.committee.id,
          forPaper,
          forPresentation,
        })
      );
      this.snackbar.open('Lucrarea a fost notată.');
      const oldGrade = paper.grades.find((grade) => grade.committeeMemberTeacherId == this.user.id);
      if (oldGrade) {
        oldGrade.forPaper = forPaper;
        oldGrade.forPresentation = forPresentation;
      } else {
        paper.grades.push({
          paperId: paper.id,
          forPaper,
          forPresentation,
          committeeMemberTeacherId: this.user.id,
          committeeMemberCommitteeId: this.committee.id,
          committeeMember: this.member,
        });
      }
    } finally {
      this.paperNeedsAttentionMap[paper.id] = null;
      this.cd.detectChanges();
    }
  }

  async getCommitteeFile(fileName: CommitteeFile) {
    let sbRef = this.snackbar.open('Se generează documentul...');
    try {
      const document = await firstValueFrom(this.committeesService.getFile(this.committee.id, fileName));
      const [mimeType, title] = CommitteeFilesFormat[fileName];
      const documentTitle = [this.committee.name, title].join(' - ');
      if(mimeType === 'application/pdf') {
        this.documentService.viewDocument(document, mimeType, documentTitle);
      } else {
        this.documentService.downloadDocument(document, documentTitle, mimeType);
      }
    } finally {
      sbRef.dismiss();
    }
  }

  async markGradesAsFinal() {
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: 'Atenție!',
        content:
          'Marcând notele drept finale, nu le veți mai putea modica.\nDe asemenea, studenții își vor putea vedea notele.',
        actions: [
          { name: 'Anulați', value: false },
          { name: 'Continuați', value: true },
        ],
      },
    });
    if(!await firstValueFrom(dialogRef.afterClosed())) return;
    this.isLoadingResults = true;
    try {
      await firstValueFrom(this.committeesService.markGradesFinal(this.committee.id, true));
      this.committee.finalGrades = true;
      this.snackbar.open('Note marcate drept finale.');
      this.updateScheduleNotice();
    } finally {
      this.isLoadingResults = false;
    }
  }
}

interface PaperNeedsAttentionMap {
  [id: number]: 'needsGrade' | 'needsDocUpload' | 'loading';
}
