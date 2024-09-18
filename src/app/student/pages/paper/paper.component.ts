import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { combineLatest, firstValueFrom, Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AreDocumentsUploaded, PaperDocumentEvent, PaperDocumentListComponent } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { EditPaperComponent } from '../../../shared/components/edit-paper/edit-paper.component';
import { StudentExtraDataEditorComponent, StudentExtraDataEditorData } from '../../../shared/components/student-extra-data-editor/student-extra-data-editor.component';
import { PaperRequiredDocument, StudentExtraData, StudentService } from '../../../services/student.service';
import { AuthService, Paper, SessionSettings } from '../../../services/auth.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { inclusiveDate, parseDate } from '../../../lib/utils';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PapersService } from '../../../services/papers.service';
import { DocumentReuploadRequest } from '../../../lib/types';
import { SubmitPaperDialogComponent } from '../../dialogs/submit-paper-dialog/submit-paper-dialog.component';
import { CommitteeSnippetComponent } from '../../../shared/components/committee-snippet/committee-snippet.component';

@Component({
  selector: 'app-student-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    LoadingComponent,
    UserSnippetComponent,
    CommitteeSnippetComponent,
    PaperDocumentListComponent,
    NgClass,
    DecimalPipe,
    DatePipe,
  ],
})
export class StudentPaperComponent implements OnInit, OnDestroy {

  constructor(
    private dialog: MatDialog,
    private student: StudentService,
    private readonly papersService: PapersService,
    private auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  PAPER_TYPES = PAPER_TYPES;

  paper: Paper = null;
  studentExtraData: StudentExtraData = null;
  documentReuploadRequests: DocumentReuploadRequest[] = [];
  isLoadingInitialData: boolean = true;
  isLoadingData: boolean;
  isWaitingForDocumentGeneration = false;
  sessionSettings: SessionSettings;
  sessionSettingsSub: Subscription;
  canUploadSecretaryFiles: boolean = true;
  canUploadPaperFiles: boolean = true;
  submissionStarted: boolean;
  areDocumentsUploaded: boolean;
  deadlinePassed: boolean = false;
  hasReuploadRequests: boolean = false;
  canEditPaper: boolean;

  requiredDocuments: PaperRequiredDocument[] = []

  async handleDocumentEvents(_: PaperDocumentEvent) {
    this.paper = await firstValueFrom(this.student.getPaper());
  }

  handleAreDocumentsUploaded(event: AreDocumentsUploaded) {
    this.areDocumentsUploaded = event.byUploader.student;
    this._checkSubmissionPeriod();
    this.deadlinePassed = (!this.canUploadSecretaryFiles && !event.byUploaderCategory.student.secretary_files) ||
      (!this.canUploadPaperFiles && !event.byUploaderCategory.student.paper_files);
    this.cd.detectChanges();
  }

  handleReuploadRequestsResolved(resolved: boolean) {
    this.hasReuploadRequests = !resolved;
    this.cd.detectChanges();
  }

  private _checkSubmissionPeriod(): void {
    const today = Date.now();
    const startDateSecretary = parseDate(this.sessionSettings.fileSubmissionStartDate).getTime();
    const endDateSecretary = inclusiveDate(this.sessionSettings.fileSubmissionEndDate).getTime();

    this.canUploadSecretaryFiles = this.sessionSettings.canUploadSecretaryFiles();
    this.canUploadPaperFiles = this.sessionSettings.canUploadPaperFiles();
    this.submissionStarted = today >= startDateSecretary;

    const paperCreatedAt = parseDate(this.paper?.createdAt);
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    this.canEditPaper = (paperCreatedAt.getTime() + SEVEN_DAYS <= today || today + SEVEN_DAYS >= endDateSecretary) &&
      today <= endDateSecretary;
  }

  ngOnInit(): void {
    this.getData();
    this.sessionSettingsSub = this.auth.sessionSettings.subscribe(settings => {
      this.sessionSettings = settings;
      this._checkSubmissionPeriod();
    })
  }

  ngOnDestroy(): void {
    this.sessionSettingsSub.unsubscribe();
  }

  async getData() {
    this.isLoadingData = true;
    const user = await firstValueFrom(this.auth.userData);
    const paperId = user.student.paper.id;
    try {
      const [paper, extraData, requiredDocuments, documentReuploadRequests] = await firstValueFrom(
        combineLatest([
          this.student.getPaper(),
          this.student.getExtraData(),
          this.student.getPaperRequiredDocuments(),
          this.papersService.getDocumentReuploadRequests(paperId)
        ])
      );
      this.paper = paper;
      this.studentExtraData = extraData;
      this.requiredDocuments = requiredDocuments;
      this.documentReuploadRequests = documentReuploadRequests;
      this._checkSubmissionPeriod();
    } finally {
      this.isLoadingInitialData = false;
      this.isLoadingData = false;
    }
  }

  async editStudentExtraData() {
    const dialogRef = this.dialog.open(StudentExtraDataEditorComponent, {
      data: {
        studentExtraData: this.studentExtraData,
        student: await firstValueFrom(this.auth.userData),
      } satisfies StudentExtraDataEditorData
    });

    const data = await firstValueFrom(dialogRef.afterClosed()) as StudentExtraData | undefined;
    if(data) {
      this.isWaitingForDocumentGeneration = true;
      const result = await firstValueFrom(this.student.setExtraData(data));
      if(!result) {
        this.isWaitingForDocumentGeneration = false;
        return;
      }
      this.studentExtraData = data;
      const [paper, requiredDocuments] = await firstValueFrom(combineLatest([
        this.student.getPaper(),
        this.student.getPaperRequiredDocuments()
      ]));
      if(paper) {
        this.paper = paper;
        this.requiredDocuments = requiredDocuments;
      }
      this.isWaitingForDocumentGeneration = false;
    }

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.isWaitingForDocumentGeneration = true;
        let subscription = this.student.setExtraData(data).pipe(
          switchMap(result => {
            if(result) {
              return combineLatest([this.student.getPaper(), this.student.getPaperRequiredDocuments()]);
            }
            return combineLatest([of(null), of([])]);
          })
        ).subscribe(([paper, requiredDocuments]) => {
          if(paper) {
            this.studentExtraData = data;
            this.paper = paper;
            this.requiredDocuments = requiredDocuments;
            subscription.unsubscribe();
          }
          this.isWaitingForDocumentGeneration = false;
        })
      }
    })
  }

  openEditDialog() {
    let dialogRef = this.dialog.open(EditPaperComponent, {
      data: this.paper
    });
    let sub = dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.getData();
      }
      sub.unsubscribe();
    })
  }

  async submitPaper(submit: boolean) {
    let action: Observable<any>;
    if(submit) {
      const confirmDialogRef = this.dialog.open(SubmitPaperDialogComponent, {
        autoFocus: 'dialog',
        data: this.paper,
      });
      if(await firstValueFrom(confirmDialogRef.afterClosed())) {
        action = this.papersService.submitPaper(this.paper.id);
      } else {
        return;
      }
    } else {
      action = this.papersService.unsubmitPaper(this.paper.id);
    }
    this.isLoadingData = true;
    const result = await firstValueFrom(action);
    this.isLoadingData = false;
    if(result) {
      this.getData();
    }
  }
}
