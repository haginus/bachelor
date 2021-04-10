import { devOnlyGuardedExpression } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Paper } from 'src/app/services/auth.service';
import { StudentExtraData, StudentService, PaperRequiredDocument } from 'src/app/services/student.service';
import { PaperDocumentEvent } from '../../../shared/paper-document-list/paper-document-list.component';
import { StudentExtraDataEditorComponent } from '../../dialogs/student-extra-data-editor/student-extra-data-editor.component';

@Component({
  selector: 'app-student-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class StudentPaperComponent implements OnInit {

  constructor(private dialog: MatDialog, private student: StudentService, private snackbar: MatSnackBar) { }

  paper: Paper = null;
  studentExtraData: StudentExtraData = null;
  isLoadingInitialData: boolean = true;
  isWaitingForDocumentGeneration = false;

  requiredDocuments: PaperRequiredDocument[] = []

  handleDocumentEvents(event: PaperDocumentEvent) {
    let sub = this.student.getPaper().subscribe(paper => {
      this.paper = paper;
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.getData();
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