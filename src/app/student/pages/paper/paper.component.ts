import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { combineLatest, firstValueFrom, Observable, of, Subscription } from 'rxjs';
import { AreDocumentsUploaded, DocumentMapElement, PaperDocumentEvent, PaperDocumentListComponent } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { EditPaperComponent } from '../../../shared/components/edit-paper/edit-paper.component';
import { UserExtraDataEditorComponent, UserExtraDataEditorData } from '../../../shared/components/user-extra-data-editor/user-extra-data-editor.component';
import { AuthService } from '../../../services/auth.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { formatDate, inclusiveDate, parseDate } from '../../../lib/utils';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PapersService } from '../../../services/papers.service';
import { Paper, SessionSettings, UserExtraData } from '../../../lib/types';
import { SubmitPaperDialogComponent } from '../../dialogs/submit-paper-dialog/submit-paper-dialog.component';
import { CommitteeSnippetComponent } from '../../../shared/components/committee-snippet/committee-snippet.component';
import { DatetimePipe } from '../../../shared/pipes/datetime.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-student-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
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
    DatetimePipe,
  ]
})
export class StudentPaperComponent implements OnInit, OnDestroy {

  constructor(
    private dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly papersService: PapersService,
    private auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  PAPER_TYPES = PAPER_TYPES;

  paper: Paper = null;
  userExtraData: UserExtraData = null;
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
  canEditExtraDataWithReuploadRequests: boolean = false;
  canEditPaper: boolean;
  paperSchedulingLocation: string | null = null;

  async handleDocumentEvents(_: PaperDocumentEvent) {
    this.paper = await firstValueFrom(this.papersService.findMineStudent());
  }

  handleAreDocumentsUploaded(event: AreDocumentsUploaded) {
    this.areDocumentsUploaded = event.byUploader.student;
    this._checkSubmissionPeriod();
    this.deadlinePassed = (!this.canUploadSecretaryFiles && !event.byUploaderCategory.student.secretary_files) ||
      (!this.canUploadPaperFiles && !event.byUploaderCategory.student.paper_files);
    this.cd.detectChanges();
  }

  handleReuploadRequestsResolved(event: DocumentMapElement[]) {
    this.hasReuploadRequests = event.length > 0;
    const documentNames = new Set(event.map(e => e.requiredDocument.name));
    if(this.hasReuploadRequests && documentNames.has('sign_up_form') && documentNames.has('liquidation_form')) {
      this.canEditExtraDataWithReuploadRequests = true;
    }
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
    try {
      const [paper, extraData] = await firstValueFrom(
        combineLatest([
          this.papersService.findMineStudent(),
          this.auth.getUserExtraData(),
        ])
      );
      this.paper = paper;
      this.userExtraData = extraData;
      this.paperSchedulingLocation = paper.scheduledGrading ? paper.committee?.activityDays.find(day => formatDate(day.startTime) === formatDate(paper.scheduledGrading))?.location : null;
      this._checkSubmissionPeriod();
    } finally {
      this.isLoadingInitialData = false;
      this.isLoadingData = false;
    }
  }

  async editUserExtraData() {
    const dialogRef = this.dialog.open(UserExtraDataEditorComponent, {
      data: {
        extraData: this.userExtraData,
        user: await firstValueFrom(this.auth.userData),
      } satisfies UserExtraDataEditorData
    });

    const result = await firstValueFrom(dialogRef.afterClosed()) as { result: UserExtraData; documentsGenerated: boolean; } | undefined;
    if(!result) return;
    this.userExtraData = result.result;
    if(!result.documentsGenerated) return;
    try {
      this.isWaitingForDocumentGeneration = true;
      this.paper = await firstValueFrom(this.papersService.findMineStudent());
    } finally {
      this.isWaitingForDocumentGeneration = false;
    }
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
    try {
      const { submission, submissionId } = await firstValueFrom(action);
      this.paper.submission = submission;
      this.paper.submissionId = submissionId;
      this.snackBar.open(submit ? 'V-ați înscris în această sesiune.' : 'V-ați retras din această sesiune.');
    } finally {
      this.isLoadingData = false;
    }
  }
}
