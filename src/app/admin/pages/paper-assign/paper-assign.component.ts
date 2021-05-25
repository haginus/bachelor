import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { Paper, Committee } from 'src/app/services/auth.service';
import { CommonDialogComponent } from 'src/app/shared/common-dialog/common-dialog.component';

@Component({
  selector: 'app-paper-assign',
  templateUrl: './paper-assign.component.html',
  styleUrls: ['./paper-assign.component.scss']
})
export class PaperAssignComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private admin: AdminService,
    private snackbar: MatSnackBar, private dialog: MatDialog) { }

  committeeId: number;
  committee: Committee;
  memberIds: number[]; // Array to keep member IDs, used to not allow papers from a teacher that is in this committee

  isLoadingCommittee: boolean = true;
  isLoadingAssignedPapers: boolean;
  isLoadingOtherPapers: boolean;

  assignedPappers: Paper[] = [];
  otherPapers: Paper[] = [];
  changesMade: boolean = false;

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
    this.admin.getPapers(undefined, undefined, null, null, 
        { assigned: false, forCommittee: this.committeeId }, true).subscribe(papers => {
      this.otherPapers = papers.rows;
      this.isLoadingOtherPapers = false;
    })
  }

  teacherIsInCommittee(teacherId: number): boolean {
    return this.memberIds.includes(teacherId);
  }

  saveChanges(): Promise<void> {
    return new Promise((resolve, reject) => {
      const paperIds = this.assignedPappers.map(paper => paper.id);
      this.admin.setCommitteePapers(this.committeeId, paperIds).subscribe(result => {
        if(result) {
          this.snackbar.open("Modificări salvate.");
          this.changesMade = false;
          resolve();
        }
        else {
          this.snackbar.open("A apărut o eroare.");
          reject();
        }
      })
    });
  }

  async goBack() {
    if(this.changesMade) {
      let dialogRef = this.dialog.open(CommonDialogComponent, {
        data: {
          title: 'Salvați modificările?',
          content: `Ați operat modificări care nu au fost salvate.\nDoriți să le salvați înainte de a merge înapoi?`,
          actions: [
            { name: 'Anulați', value: 'dismiss' },
            { name: 'Renunțați la modificări', value: 'discard' },
            { name: 'Salvați', value: 'save' },
          ]
        }
      });
      let sub = dialogRef.afterClosed().subscribe(result => {
        if(result == 'save') {
          this.saveChanges()
          .then(() => {
            this.router.navigate(['admin', 'committees']);
          })
          .catch(() => {});
        } else if(result == 'discard') {
          this.router.navigate(['admin', 'committees']);
        }
        sub.unsubscribe();
      })
    } else {
      this.router.navigate(['admin', 'committees']);
    }
  }

  drop(event: CdkDragDrop<Paper[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      this.changesMade = true;
    }
  }

}
