import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AuthService, Committee, Paper, UserData } from 'src/app/services/auth.service';
import { BehaviorSubject, combineLatest, merge, Subscription } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { TeacherService } from 'src/app/services/teacher.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AreDocumentsUploaded } from 'src/app/shared/paper-document-list/paper-document-list.component';
import { MatDialog } from '@angular/material/dialog';
import { GradePaperComponent } from '../../dialogs/grade-paper/grade-paper.component';
import { CommitteeDocument, DocumentService } from 'src/app/services/document.service';
import { CommonDialogComponent } from 'src/app/shared/common-dialog/common-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PAPER_TYPES } from 'src/app/lib/constants';


@Component({
  selector: 'app-committee-papers',
  templateUrl: './committee-papers.component.html',
  styleUrls: ['./committee-papers.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TeacherCommitteePapersComponent implements OnInit {

  constructor(private teacher: TeacherService, private route: ActivatedRoute, private router: Router,
    private cd: ChangeDetectorRef, private auth: AuthService, private dialog: MatDialog,
    private documentService: DocumentService, private snackbar: MatSnackBar) { }

  displayedColumns: string[] = ['status', 'title', 'type', 'student', 'teacher'];
  expandedPaper: Paper | null;
  resultsLength: number;
  isLoadingResults: boolean = true;
  data: Paper[] = [];
  committee: Committee;
  gradingAllowed: boolean = false;
  user: UserData;
  hasGenerationRights: boolean = false;

  // Map to store whether paper needs attention.
  paperNeedsAttentionMap: PaperNeedsAttentionMap = {};

  paperSubscription: Subscription;
  performedActions: BehaviorSubject<string> = new BehaviorSubject('');

  PAPER_TYPES = PAPER_TYPES;

  @ViewChild('table') table: MatTable<Paper>;

  ngOnInit(): void {
    this.paperSubscription = 
      combineLatest([this.route.params, this.auth.getSessionSettings(), this.auth.getUserData(), this.performedActions]).pipe(
        switchMap(([params, settings, userData]) => {
          this.gradingAllowed = settings.allowGrading;
          this.user = userData;
          this.isLoadingResults = true;
          return this.teacher.getCommittee(+params.id);
        })
      )
      .subscribe(committee => {
        if(committee == null) {
          this.router.navigate(['teacher', 'committees']);
        } else {
          this.committee = committee;
          this.data = committee.papers;
          this.isLoadingResults = false;
          // Check if user has rights to generate committee documents
          let president = this.committee.members.find(member => member.role == 'president');
          let secretary = this.committee.members.find(member => member.role == 'secretary');
          let teacherId = this.user.teacher.id;
          this.hasGenerationRights = teacherId == president?.teacherId || teacherId == secretary?.teacherId;
        }
      });
  }

  refreshResults() {
    this.performedActions.next("refresh");
  }

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: Paper) {
    if(!event.byUploader.committee) {
      this.paperNeedsAttentionMap[paper.id] = 'needsDocUpload';
    } else {
      // Check if the user has not given a grade
      if(!this._checkPaperGraded(paper)) {
        this.paperNeedsAttentionMap[paper.id] = 'needsGrade';
      } else {
        this.paperNeedsAttentionMap[paper.id] = null;
      }
    }
    // Detect changes so that the new value is reflected it the DOM
    this.cd.detectChanges();
  }

  private _checkPaperGraded(paper: Paper): boolean {
    const member = this.committee.members.find(member => member.teacherId == this.user.teacher.id);
    // Return true if user is secretary (they don't need to grade)
    if(member.role == 'secretary') {
      return true;
    }
    // Return true if teacher has a grade given to this paper
    return paper.grades.findIndex(grade => grade.teacherId == this.user.teacher.id) >= 0;
  }

  gradePaper(paper: Paper) {
    const dialogRef = this.dialog.open(GradePaperComponent);

    let sub = dialogRef.afterClosed().subscribe(result => {
      if(result) {
        const { forPaper, forPresentation } = result;
        this.paperNeedsAttentionMap[paper.id] = 'loading';
        let gradeSub = this.teacher.gradePaper(paper.id, forPaper, forPresentation).subscribe(result => {
          if(result) {
            let oldGrade = paper.grades.find(grade => grade.teacherId == this.user.teacher.id);
            if(oldGrade) {
              oldGrade.forPaper = forPaper;
              oldGrade.forPresentation = forPresentation;
            } else {
              paper.grades.push({ forPaper, forPresentation, teacherId: this.user.teacher.id, teacher: { user: <any>this.user } });
            }
          }
          this.paperNeedsAttentionMap[paper.id] = null;
          this.cd.detectChanges();
          gradeSub.unsubscribe();
        })
      }
      sub.unsubscribe();
    })
  }

  private downloadDocument(buffer: ArrayBuffer, documentName: CommitteeDocument) {
    let downloadTitle = this.committee.name;
    if(documentName == 'catalog') {
      downloadTitle += '-CATALOG-COMISIE'
    } else if(documentName == 'final_catalog') {
      downloadTitle += '-CATALOG-FINAL';
    }
    downloadTitle += '.pdf';
    this.documentService.downloadDocument(buffer, downloadTitle, 'application/pdf');
  }

  generateCommitteeCatalog() {
    this.isLoadingResults = true;
    this.documentService.getCommitteeDocument(this.committee.id, 'catalog').subscribe(buffer => {
      if(buffer) {
        this.downloadDocument(buffer, 'catalog');
      }
      this.isLoadingResults = false;
    });
  }

  generateCommitteeFinalCatalog() {
    this.isLoadingResults = true;
    this.documentService.getCommitteeDocument(this.committee.id, 'final_catalog').subscribe(buffer => {
      if(buffer) {
        this.downloadDocument(buffer, 'final_catalog');
      }
      this.isLoadingResults = false;
    });
  }

  markGradesAsFinal() {
    let dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: 'Atenție!',
        content: 'Marcând notele drept finale, nu le veți mai putea modica.\nDe asemenea, studenții își vor putea vedea notele.',
        actions: [
          { name: 'Anulați', value: false },
          { name: 'Continuați', value: true }
        ]
      }
    });
    let sub = dialogRef.afterClosed().subscribe(consent => {
      if(consent) {
        this.isLoadingResults = true;
        this.teacher.markGradesAsFinal(this.committee.id).subscribe(res => {
          if(res) {
            this.committee.finalGrades = true;
            this.snackbar.open("Note marcate drept finale.");
          }
          this.isLoadingResults = false;
        })
      }
      sub.unsubscribe();
    })
  }

}

interface PaperNeedsAttentionMap {
  [id: number]: 'needsGrade' | 'needsDocUpload' | 'loading';
}
