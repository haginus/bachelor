import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { Paper, Committee } from 'src/app/services/auth.service';

@Component({
  selector: 'app-paper-assign',
  templateUrl: './paper-assign.component.html',
  styleUrls: ['./paper-assign.component.scss']
})
export class PaperAssignComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private admin: AdminService,
    private snackbar: MatSnackBar) { }

  committeeId: number;
  committee: Committee;
  memberIds: number[]; // Array to keep member IDs, used to not allow papers from a teacher that is in this committee

  isLoadingCommittee: boolean = true;
  isLoadingAssignedPapers: boolean;
  isLoadingOtherPapers: boolean;

  assignedPappers: Paper[] = [];
  otherPapers: Paper[] = [];


  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        let committeeId = params.committeeId;
        if(committeeId && parseInt(committeeId)) {
          this.committeeId = parseInt(committeeId);
        } else {
          throw "INVALID_ID";
        }
        return this.admin.getCommittee(this.committeeId);
      }),
      map(committee => {
        if(!committee) {
          throw "COMMITTEE_NOT_FOUND";
        }
        return committee;
      }),
      catchError(() => {
        this.router.navigate(['admin', 'committees']);
        return of(null);
      })
    ).subscribe(committee => {
      this.committee = committee;
      this.memberIds = this.committee.members.map(m => m.teacherId);
      this.isLoadingCommittee = false;
      this.getLeftPapers();
      this.getRightPapers();
    });
  }

  private getLeftPapers() {
    this.isLoadingAssignedPapers = true;
    this.admin.getPapers(undefined, undefined, null, null, { assignedTo: this.committeeId }, true).subscribe(papers => {
      this.assignedPappers = papers.rows;
      this.isLoadingAssignedPapers = false;
    })
  }

  private getRightPapers() {
    this.isLoadingOtherPapers = true;
    this.admin.getPapers(undefined, undefined, null, null, { assigned: false }, true).subscribe(papers => {
      this.otherPapers = papers.rows;
      this.isLoadingOtherPapers = false;
    })
  }

  teacherIsInCommittee(teacherId: number): boolean {
    return this.memberIds.includes(teacherId);
  }

  saveChanges() {
    const paperIds = this.assignedPappers.map(paper => paper.id);
    this.admin.setCommitteePapers(this.committeeId, paperIds).subscribe(result => {
      if(result) {
        this.snackbar.open("Modificări salvate.");
      }
      else {
        this.snackbar.open("A apărut o eroare.");
      }
    })
  }

  drop(event: CdkDragDrop<Paper[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

}
