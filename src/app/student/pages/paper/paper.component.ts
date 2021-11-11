import { devOnlyGuardedExpression } from '@angular/compiler';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService, Paper, SessionSettings } from 'src/app/services/auth.service';
import { StudentExtraData, StudentService, PaperRequiredDocument } from 'src/app/services/student.service';
import { PAPER_TYPES } from 'src/app/lib/constants';
import { AreDocumentsUploaded, PaperDocumentEvent } from '../../../shared/paper-document-list/paper-document-list.component';
import { EditPaperComponent } from '../../dialogs/edit-paper/edit-paper.component';
import { StudentExtraDataEditorComponent } from '../../dialogs/student-extra-data-editor/student-extra-data-editor.component';

@Component({
  selector: 'app-student-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class StudentPaperComponent implements OnInit, OnDestroy {

  constructor(private dialog: MatDialog, private student: StudentService, private snackbar: MatSnackBar,
    private auth: AuthService, private cd: ChangeDetectorRef) { }

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
                          (!this.canUploadPaperFiles && !event.byUploaderCategory.student.paper_files)
    this.cd.detectChanges();
  }

  private _checkSubmissionPeriod(): void {
    const today = new Date().setHours(0, 0, 0, 0);
    const startDateSecretary = new Date(this.sessionSettings.fileSubmissionStartDate).setHours(0, 0, 0, 0);
    const endDateSecretary = new Date(this.sessionSettings.fileSubmissionEndDate).setHours(0, 0, 0, 0);

    const endDatePaper = new Date(this.sessionSettings.paperSubmissionEndDate).setHours(0, 0, 0, 0);

    this.canUploadSecretaryFiles = startDateSecretary <= today && today <= endDateSecretary;
    this.canUploadPaperFiles = startDateSecretary <= today && today <= endDatePaper;
    this.submissionStarted = today >= startDateSecretary;
    
    const paperCreatedAt = new Date(this.paper?.createdAt);
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

  editStudentExtraData() {
    const dialogRef = this.dialog.open(StudentExtraDataEditorComponent, {
      data: this.studentExtraData,
      width: '100%'
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
        ).subscribe( ([paper, requiredDocuments ]) => {
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
}