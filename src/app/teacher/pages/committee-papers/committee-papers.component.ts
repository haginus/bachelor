import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { BehaviorSubject, combineLatest, merge, Subscription } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GradePaperComponent } from '../../dialogs/grade-paper/grade-paper.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { TeacherService } from '../../../services/teacher.service';
import { AuthService, Committee, CommitteeMember, Paper, UserData } from '../../../services/auth.service';
import { CommitteeDocument, CommitteeDocumentsFormat, DocumentService } from '../../../services/document.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { AreDocumentsUploaded } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { detailExpand, rowAnimation } from '../../../row-animations';

@Component({
  selector: 'app-committee-papers',
  templateUrl: './committee-papers.component.html',
  styleUrls: ['./committee-papers.component.scss'],
  animations: [
    rowAnimation,
    detailExpand,
  ],
})
export class TeacherCommitteePapersComponent implements OnInit, AfterViewInit {
  constructor(
    private teacher: TeacherService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private dialog: MatDialog,
    private documentService: DocumentService,
    private snackbar: MatSnackBar
  ) {}

  displayedColumns: string[] = [
    'status',
    'id',
    'title',
    'type',
    'student',
    'teacher',
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
          return this.teacher.getCommittee(+params['id']);
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
            (member) => member.teacherId == this.user.teacher.id
          );
          this.hasGenerationRights = ['president', 'secretary'].includes(
            this.member.role
          );
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
        (grade) => grade.teacherId == this.user.teacher.id
      ) >= 0
    );
  }

  gradePaper(paper: Paper) {
    const dialogRef = this.dialog.open(GradePaperComponent);

    let sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { forPaper, forPresentation } = result;
        this.paperNeedsAttentionMap[paper.id] = 'loading';
        let gradeSub = this.teacher
          .gradePaper(paper.id, forPaper, forPresentation)
          .subscribe((result) => {
            if (result) {
              let oldGrade = paper.grades.find(
                (grade) => grade.teacherId == this.user.teacher.id
              );
              if (oldGrade) {
                oldGrade.forPaper = forPaper;
                oldGrade.forPresentation = forPresentation;
              } else {
                paper.grades.push({
                  forPaper,
                  forPresentation,
                  teacherId: this.user.teacher.id,
                  teacher: { user: <any>this.user },
                });
              }
            }
            this.paperNeedsAttentionMap[paper.id] = null;
            this.cd.detectChanges();
            gradeSub.unsubscribe();
          });
      }
      sub.unsubscribe();
    });
  }

  private downloadDocument(buffer: ArrayBuffer, documentName: CommitteeDocument) {
    let downloadTitle = this.committee.name;
    if (documentName == 'catalog') {
      downloadTitle += '-CATALOG-COMISIE';
    } else if (documentName == 'final_catalog') {
      downloadTitle += '-CATALOG-FINAL';
    }
    downloadTitle += `.${CommitteeDocumentsFormat[documentName][0]}`;
    this.documentService.downloadDocument(
      buffer,
      downloadTitle,
      CommitteeDocumentsFormat[documentName][1]
    );
  }

  generateCommitteeDocument(documentName: CommitteeDocument) {
    this.isLoadingResults = true;
    this.documentService
      .getCommitteeDocument(this.committee.id, documentName)
      .subscribe((buffer) => {
        if (buffer) {
          this.downloadDocument(buffer, documentName);
        }
        this.isLoadingResults = false;
      });
  }

  markGradesAsFinal() {
    let dialogRef = this.dialog.open(CommonDialogComponent, {
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
    let sub = dialogRef.afterClosed().subscribe((consent) => {
      if (consent) {
        this.isLoadingResults = true;
        this.teacher.markGradesAsFinal(this.committee.id).subscribe((res) => {
          if (res) {
            this.committee.finalGrades = true;
            this.snackbar.open('Note marcate drept finale.');
          }
          this.isLoadingResults = false;
        });
      }
      sub.unsubscribe();
    });
  }
}

interface PaperNeedsAttentionMap {
  [id: number]: 'needsGrade' | 'needsDocUpload' | 'loading';
}
