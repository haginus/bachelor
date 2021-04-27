import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Paper } from 'src/app/services/auth.service';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { TeacherService } from 'src/app/services/teacher.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AreDocumentsUploaded } from 'src/app/shared/paper-document-list/paper-document-list.component';


@Component({
  selector: 'app-committee-papers',
  templateUrl: './committee-papers.component.html',
  styleUrls: ['./committee-papers.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TeacherCommitteePapersComponent implements OnInit {

  constructor(private teacher: TeacherService, private route: ActivatedRoute, private router: Router,
    private cd: ChangeDetectorRef) { }

  displayedColumns: string[] = ['status', 'title', 'type', 'student', 'teacher'];
  expandedPaper: Paper | null;
  resultsLength: number;
  isLoadingResults: boolean = true;
  data: Paper[] = [];

  // Map to store whether paper needs attention.
  paperNeedsAttentionMap: PaperNeedsAttentionMap = {};

  paperSubscription: Subscription;

  @ViewChild('table') table: MatTable<Paper>;

  ngOnInit(): void {
    this.paperSubscription = this.route.params.pipe(
      switchMap(params => {
        this.isLoadingResults = true;
        return this.teacher.getCommittee(+params.id);
      })
    )
   .subscribe(committee => {
      if(committee == null) {
        this.router.navigate(['teacher', 'committees']);
      } else {
        this.data = committee.papers;
        this.isLoadingResults = false;
      }
    })
  }

  handleAreDocumentsUploadedEvent(event: AreDocumentsUploaded, paper: Paper) {
    if(!event.byUploader.committee) {
      this.paperNeedsAttentionMap[paper.id] = 'needsDocUpload';
    } else {
      // needs grade check
      this.paperNeedsAttentionMap[paper.id] = 'needsGrade';

    }
    // Detect changes so that the new value is reflected it the DOM
    this.cd.detectChanges();
  }

}

interface PaperNeedsAttentionMap {
  [id: number]: 'needsGrade' | 'needsDocUpload'
}
