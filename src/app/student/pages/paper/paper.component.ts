import { devOnlyGuardedExpression } from '@angular/compiler';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService, Paper, SessionSettings } from 'src/app/services/auth.service';
import { StudentExtraData, StudentService, PaperRequiredDocument } from 'src/app/services/student.service';
import { AreDocumentsUploaded, PaperDocumentEvent } from '../../../shared/paper-document-list/paper-document-list.component';
import { StudentExtraDataEditorComponent } from '../../dialogs/student-extra-data-editor/student-extra-data-editor.component';

@Component({
  selector: 'app-student-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class StudentPaperComponent implements OnInit, OnDestroy {

  constructor(private dialog: MatDialog, private student: StudentService, private snackbar: MatSnackBar,
    private auth: AuthService, private cd: ChangeDetectorRef) { }

  paper: Paper = null;
  studentExtraData: StudentExtraData = null;
  isLoadingInitialData: boolean = true;
  isWaitingForDocumentGeneration = false;
  sessionSettings: SessionSettings;
  sessionSettingsSub: Subscription;
  canUploadSecretaryFiles: boolean = true;
  canUploadPaperFiles: boolean = true;
  areDocumentsUploaded: boolean;
  deadlinePassed: boolean = false;

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
    let subscription = combineLatest([this.student.getPaper(), this.student.getExtraData(), this.student.getPaperRequiredDocuments()])
      .subscribe(([paper, extraData, requiredDocuments]) => {
        this.paper = paper;
        this.requiredDocuments = requiredDocuments;
        this.studentExtraData = extraData;
        this.isLoadingInitialData = false;
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
}