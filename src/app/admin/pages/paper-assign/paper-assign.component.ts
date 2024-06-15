import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { Committee, Paper } from '../../../services/auth.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';

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
  isMasterCommittee: boolean = false;

  isLoadingCommittee: boolean = true;
  isLoadingAssignedPapers: boolean;
  isLoadingOtherPapers: boolean;

  assignedPappers: Paper[] = [];
  otherPapers: Paper[] = [];
  changesMade: boolean = false;

  paperFilter = new FormGroup({
    title: new FormControl(''),
    type: new FormControl(null),
    studentName: new FormControl(''),
  });

  PAPER_TYPES = PAPER_TYPES;

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params => {
        let committeeId = params['committeeId'];
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
      this.isMasterCommittee = this.committee.domains.some(d => d.type == 'master');
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
    const filterChanges = this.paperFilter.valueChanges.pipe(debounceTime(500));
    filterChanges.pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingOtherPapers = true;
        const { title, type, studentName } = this.paperFilter.value;
        return this.admin.getPapers(undefined, undefined, null, null,
        { assigned: false, forCommittee: this.committeeId, submitted: true, isNotValid: false, title, type, studentName }, true)
      })
    ).subscribe(papers => {
      this.otherPapers = papers.rows;
      this.isLoadingOtherPapers = false;
    });
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
