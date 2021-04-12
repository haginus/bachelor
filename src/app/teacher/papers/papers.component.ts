import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Paper } from 'src/app/services/auth.service';
import { PaperDocumentTypes } from 'src/app/services/student.service';
import { TeacherService } from 'src/app/services/teacher.service';
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
export class TeacherPapersComponent implements OnInit {

  constructor(private teacher: TeacherService, private cd: ChangeDetectorRef) { }

  displayedColumns: string[] = ['status', 'title', 'type', 'student', 'committee'];
  expandedPaper: Paper | null;
  resultsLength: number;
  isLoadingResults: boolean = true;
  data: Paper[] = [];

  // Map to store whether paper needs attention.
  paperNeedsAttentionMap: PaperNeedsAttentionMap = {};

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');


  ngOnInit(): void {
    this.teacher.getStudentPapers().subscribe(papers => {
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

}

interface PaperNeedsAttentionMap {
  [name: number]: boolean
}