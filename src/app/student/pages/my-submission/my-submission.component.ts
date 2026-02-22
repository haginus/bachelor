import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';
import { CommitteeSnippetComponent } from '../../../shared/components/committee-snippet/committee-snippet.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth.service';
import { PapersService } from '../../../services/papers.service';
import { ActivatedRoute } from '@angular/router';
import { Paper, Student, Submission, UserExtraData } from '../../../lib/types';
import { CIVIL_STATE, PAPER_TYPES } from '../../../lib/constants';
import { formatDate, getNowSignal, inclusiveDate, parseDate } from '../../../lib/utils';
import { DatetimePipe } from '../../../shared/pipes/datetime.pipe';
import { first, firstValueFrom } from 'rxjs';
import { EditPaperComponent } from '../../../shared/components/edit-paper/edit-paper.component';
import { MatTooltip } from "@angular/material/tooltip";
import { DatePipe } from '@angular/common';
import { AreDocumentsUploaded, DocumentMapElement, PaperDocumentEvent, PaperDocumentListComponent } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { UserExtraDataEditorComponent, UserExtraDataEditorData } from '../../../shared/components/user-extra-data-editor/user-extra-data-editor.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SubmitPaperDialogComponent } from '../../dialogs/submit-paper-dialog/submit-paper-dialog.component';
import { SubmissionsService } from '../../../services/submissions.service';
import { WrittenExamService } from '../../../services/written-exam.service';

@Component({
  selector: 'app-my-submission',
  imports: [
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    UserSnippetComponent,
    CommitteeSnippetComponent,
    DatetimePipe,
    DatePipe,
    MatTooltip,
    PaperDocumentListComponent,
    MatExpansionModule,
  ],
  templateUrl: './my-submission.component.html',
  styleUrl: './my-submission.component.scss',
})
export class MySubmissionComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);
  private readonly papersService = inject(PapersService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly writtenExamService = inject(WrittenExamService);

  user = toSignal<Student>(this.authService.userData.pipe(first()));
  sessionSettings = toSignal(this.authService.sessionSettings);
  submission = signal<Submission>(this.route.snapshot.data['submission']);
  paper = signal<Paper>(this.route.snapshot.data['paper']);
  extraData = signal<UserExtraData>(this.route.snapshot.data['extraData']);
  areSecretaryDocumentsUploaded = signal<AreDocumentsUploaded | null>(null);
  arePaperDocumentsUploaded = signal<AreDocumentsUploaded | null>(null);
  reuploadRequestSecretaryDocuments = signal<DocumentMapElement[]>([]);
  reuploadRequestPaperDocuments = signal<DocumentMapElement[]>([]);
  isWaitingForDocumentGeneration = signal(false);

  hasWrittenExam = computed(() => this.user()?.specialization.domain.hasWrittenExam ?? false);

  paperSchedulingLocation = computed(
    () => this.paper().scheduledGrading
      ? this.paper().committee?.activityDays.find(day => formatDate(day.startTime) === formatDate(this.paper().scheduledGrading))?.location
      : null
  );

  now = getNowSignal();

  canDisputeWrittenExamGrade = computed(() => (
    this.sessionSettings().writtenExamDisputeEndDate &&
    this.now() <= inclusiveDate(this.sessionSettings().writtenExamDisputeEndDate) &&
    (this.submission().writtenExamGrade?.initialGrade ?? 0) !== 0
  ));
  writtenExamFinalGrade = computed(() => {
    const grade = this.submission().writtenExamGrade;
    if(!grade || (this.canDisputeWrittenExamGrade() && !grade.isDisputed)) return null;
    if(grade.isDisputed && !grade.disputeGrade) return null;
    return Math.max(grade.initialGrade, grade.disputeGrade ?? 0);
  });
  submissionStarted = computed(() => this.now() >= parseDate(this.sessionSettings().fileSubmissionStartDate));
  canUploadSecretaryFiles = computed(() => this.now() && this.sessionSettings().canUploadSecretaryFiles());
  canUploadPaperFiles = computed(() => this.now() && this.sessionSettings().canUploadPaperFiles());
  reuploadRequestDocuments = computed(() => [...this.reuploadRequestSecretaryDocuments(), ...this.reuploadRequestPaperDocuments()]);
  hasPendingReuploadRequests = computed(() => this.reuploadRequestDocuments().filter(doc => !doc.isUploaded).length > 0);
  deadlinePassed = computed(() => (
    (!this.canUploadSecretaryFiles() && !this.areSecretaryDocumentsUploaded()?.byUploader.student) ||
    (!this.canUploadPaperFiles() && !this.arePaperDocumentsUploaded()?.byUploader.student)
  ));
  areAllDocumentsUploaded = computed(() => {
    const secretaryFilesUploaded = this.areSecretaryDocumentsUploaded()?.byUploader.student ?? false;
    const paperFilesUploaded = this.arePaperDocumentsUploaded()?.byUploader.student ?? false;
    return secretaryFilesUploaded && paperFilesUploaded;
  });
  submissionRequirements = computed(() => {
    return [
      { title: 'Completați datele necesare înscrierii', fulfilled: !!this.extraData() },
      { title: 'Semnați cererea de înscriere', fulfilled: this.paper().documents.some(d => d.name === 'sign_up_form' && d.type === 'signed') },
    ];
  });
  allSubmissionRequirementsFulfilled = computed(() => this.submissionRequirements().every(r => r.fulfilled));

  canEditPaper = computed(() => {
    const paperCreatedAt = parseDate(this.paper()?.createdAt);
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const nowMs = this.now().getTime();
    const endDateSecretary = inclusiveDate(this.sessionSettings().fileSubmissionEndDate).getTime();
    return (
      (paperCreatedAt.getTime() + SEVEN_DAYS <= nowMs || nowMs + SEVEN_DAYS >= endDateSecretary) &&
      nowMs <= endDateSecretary
    );
  });

  canEditExtraData = computed(() => {
    const reuploadRequestDocumentNames = new Set(this.reuploadRequestDocuments().map(doc => doc.requiredDocument.name));
    return this.paper().isValid == null && (
      this.canUploadSecretaryFiles() ||
      (reuploadRequestDocumentNames.has('sign_up_form') && reuploadRequestDocumentNames.has('liquidation_form'))
    );
  });

  requiredSecretaryDocuments = computed(() => {
    const requiredDocuments = this.paper()?.requiredDocuments || [];
    return requiredDocuments.filter(doc => doc.category === 'secretary_files');
  });

  requiredPaperDocuments = computed(() => {
    const requiredDocuments = this.paper()?.requiredDocuments || [];
    return requiredDocuments.filter(doc => doc.category === 'paper_files');
  });

  async openEditPaperDialog() {
    const dialogRef = this.dialog.open(EditPaperComponent, {
      data: this.paper(),
    });
    const result: { result: Paper; } | undefined = await firstValueFrom(dialogRef.afterClosed());
    if(result?.result) {
      this.paper.set(result.result);
    }
  }

  async openUserExtraDataEditorDialog() {
    const dialogRef = this.dialog.open(UserExtraDataEditorComponent, {
      data: {
        extraData: this.extraData(),
        user: await firstValueFrom(this.authService.userData),
      } satisfies UserExtraDataEditorData
    });

    const result = await firstValueFrom(dialogRef.afterClosed()) as { result: UserExtraData; documentsGenerated: boolean; } | undefined;
    if(!result) return;
    this.extraData.set(result.result);
    if(!result.documentsGenerated) return;
    try {
      this.isWaitingForDocumentGeneration.set(true);
      this.paper.set(await firstValueFrom(this.papersService.findMineStudent()));
    } finally {
      this.isWaitingForDocumentGeneration.set(false);
    }
  }

  async toggleSubmission(isSubmitted: boolean) {
    let result: Submission;
    if(isSubmitted) {
      const confirmDialogRef = this.dialog.open(SubmitPaperDialogComponent, {
        autoFocus: 'dialog',
        data: this.paper(),
      });
      if(!await firstValueFrom(confirmDialogRef.afterClosed())) return;
      result = await firstValueFrom(this.submissionsService.submit(this.submission().id));
      this.snackBar.open('V-ați înscris în această sesiune.');
    } else {
      result = await firstValueFrom(this.submissionsService.unsubmit(this.submission().id));
      this.snackBar.open('V-ați retras din această sesiune.');
    }
    this.submission.set(result);
  }

  async onDocumentsChange(event: PaperDocumentEvent) {
    this.paper.update(paper => ({ ...paper, documents: event.documents }));
  }

  async disputeWrittenExamGrade() {
    const writtenExamGrade = await firstValueFrom(this.writtenExamService.disputeGrade(this.submission().id));
    this.submission.update(submission => ({ ...submission, writtenExamGrade }));
    this.snackBar.open('Ați contestat nota la examenul scris.');
  }

  PAPER_TYPES = PAPER_TYPES;
  CIVIL_STATE = CIVIL_STATE;
}
