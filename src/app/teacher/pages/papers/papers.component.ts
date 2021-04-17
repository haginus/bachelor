import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Paper } from 'src/app/services/auth.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { CommonDialogComponent } from 'src/app/shared/common-dialog/common-dialog.component';
import { AreDocumentsUploaded, PaperDocumentEvent } from 'src/app/shared/paper-document-list/paper-document-list.component';

@Component({
  selector: 'app-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TeacherPapersComponent implements OnInit, OnDestroy {

  constructor(private teacher: TeacherService, private cd: ChangeDetectorRef, private dialog: MatDialog,
    private snackbar: MatSnackBar) { }

  displayedColumns: string[] = ['status', 'title', 'type', 'student', 'committee'];
  expandedPaper: Paper | null;
  resultsLength: number;
  isLoadingResults: boolean = true;
  data: Paper[] = [];

  // Map to store whether paper needs attention.
  paperNeedsAttentionMap: PaperNeedsAttentionMap = {};

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');
  paperSubscription: Subscription;

  @ViewChild('table') table: MatTable<Paper>;

  ngOnInit(): void {
    this.paperSubscription = this.performedActions.pipe(
      switchMap(action => {
        this.isLoadingResults = true;
        return this.teacher.getStudentPapers();
      })
    )
   .subscribe(papers => {
      this.data = papers as Paper[];
      this.isLoadingResults = false;
    })
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  handleDocumentEvents(event: PaperDocumentEvent, paperId: number) {

  }

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: Paper) {
    this.paperNeedsAttentionMap[paper.id] = !event.byUploader.teacher;
    // Detect changes so that the new value is reflected it the DOM
    this.cd.detectChanges();
  }

  removePaper(paper: Paper) {
    let dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: 'Rupeți asocierea?',
        content: 'Sunteți sigur că doriți să rupeți asocierea?\nStudentul va trebui să își găsească alt profesor.',
        actions: [
          {
            name: 'Anulați',
            value: false
          },
          {
            name: 'Rupeți asocierea',
            value: true
          }
        ]
      }
    });

    let sub = dialogRef.afterClosed().pipe(
      switchMap(result => {
        // If dialog result is true, return removePaper observable, else return Observable<null>
        return result == true ? this.teacher.removePaper(paper.id) : of(null);
      })
    ).subscribe(result => {
      // If dialog result was false, exit
      if(result == null) {
        return;
      }
      let msg = result ? 'Asociere ruptă' : 'A apărut o eroare.';
      this.snackbar.open(msg);
      // If delete was successful, remove paper from table
      if(result) {
        let idx = this.data.findIndex(p => paper.id == p.id);
        this.data.splice(idx, 1);
        this.table.renderRows();
      }

      sub.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this.paperSubscription.unsubscribe();
  }
}

interface PaperNeedsAttentionMap {
  [name: number]: boolean
}