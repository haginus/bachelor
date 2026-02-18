import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';
import { CommitteeSnippetComponent } from '../../../shared/components/committee-snippet/committee-snippet.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth.service';
import { PapersService } from '../../../services/papers.service';
import { ActivatedRoute } from '@angular/router';
import { Paper, Student, UserExtraData } from '../../../lib/types';
import { PAPER_TYPES } from '../../../lib/constants';
import { formatDate, inclusiveDate, parseDate } from '../../../lib/utils';
import { DatetimePipe } from '../../../shared/pipes/datetime.pipe';
import { firstValueFrom, interval, map } from 'rxjs';
import { EditPaperComponent } from '../../../shared/components/edit-paper/edit-paper.component';
import { MatTooltip } from "@angular/material/tooltip";
import { DatePipe } from '@angular/common';
import { AreDocumentsUploaded, PaperDocumentListComponent } from '../../../shared/components/paper-document-list/paper-document-list.component';
import { UserExtraDataEditorComponent, UserExtraDataEditorData } from '../../../shared/components/user-extra-data-editor/user-extra-data-editor.component';
import { MatExpansionModule } from '@angular/material/expansion';

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
  private readonly authService = inject(AuthService);
  private readonly papersService = inject(PapersService);

  user = toSignal<Student>(this.authService.userData);
  sessionSettings = toSignal(this.authService.sessionSettings);
  paper = signal<Paper>(this.route.snapshot.data['paper']);
  extraData = signal<UserExtraData>(this.route.snapshot.data['extraData']);
  areSecretaryDocumentsUploaded = signal<AreDocumentsUploaded | null>(null);
  arePaperDocumentsUploaded = signal<AreDocumentsUploaded | null>(null);
  isWaitingForDocumentGeneration = signal(false);

  hasWrittenExam = computed(() => this.user()?.specialization.domain.hasWrittenExam ?? false);

  paperSchedulingLocation = computed(
    () => this.paper().scheduledGrading
      ? this.paper().committee?.activityDays.find(day => formatDate(day.startTime) === formatDate(this.paper().scheduledGrading))?.location
      : null
  );

  now = toSignal(interval(60000).pipe(map(() => new Date())), { initialValue: new Date() });

  submissionStarted = computed(() => this.now() >= parseDate(this.sessionSettings().fileSubmissionStartDate));
  canUploadSecretaryFiles = computed(() => this.now() && this.sessionSettings().canUploadSecretaryFiles());
  canUploadPaperFiles = computed(() => this.now() && this.sessionSettings().canUploadPaperFiles());
  deadlinePassed = computed(() => (
    (!this.canUploadSecretaryFiles() && !this.areSecretaryDocumentsUploaded()?.byUploader.student) ||
    (!this.canUploadPaperFiles() && !this.arePaperDocumentsUploaded()?.byUploader.student)
  ));

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

  PAPER_TYPES = PAPER_TYPES;
}
