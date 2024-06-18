import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { combineLatest, firstValueFrom, of, Subscription } from 'rxjs';
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
  canEditPaper: boolean;

  requiredDocuments: PaperRequiredDocument[] = []

  handleDocumentEvents(event: PaperDocumentEvent) {
    let sub = this.student.getPaper().subscribe(paper => {
      this.paper = paper;
      sub.unsubscribe();
    });
  }

  handleAreDocumentsUploaded(event: AreDocumentsUploaded) {
    this.areDocumentsUploaded = event.byUploader.student;
    this._checkSubmissionPeriod();
    this.deadlinePassed = (!this.canUploadSecretaryFiles && !event.byUploaderCategory.student.secretary_files) ||
      (!this.canUploadPaperFiles && !event.byUploaderCategory.student.paper_files);
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

  getData() {
    this.isLoadingData = true;
    let subscription = combineLatest([this.student.getPaper(), this.student.getExtraData(), this.student.getPaperRequiredDocuments()])
      .subscribe(([paper, extraData, requiredDocuments]) => {
        this.paper = paper;
        this.requiredDocuments = requiredDocuments;
        this.studentExtraData = extraData;
        this.isLoadingInitialData = false;
        this.isLoadingData = false;
        subscription.unsubscribe();
      });
  }

  async editStudentExtraData() {
    const dialogRef = this.dialog.open(StudentExtraDataEditorComponent, {
      data: {
        studentExtraData: this.studentExtraData,
        student: await firstValueFrom(this.auth.userData),
      } satisfies StudentExtraDataEditorData
    });

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
    this.isLoadingData = true;
    const action = submit
      ? this.papersService.submitPaper(this.paper.id)
      : this.papersService.unsubmitPaper(this.paper.id);
    const result = await firstValueFrom(action);
    this.isLoadingData = false;
    if(result) {
      this.getData();
    }
  }
}
