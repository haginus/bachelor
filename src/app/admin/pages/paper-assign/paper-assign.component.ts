import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { PAPER_TYPES } from '../../../lib/constants';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { CommitteesService } from '../../../services/committees.service';
import { Committee, Paper, Specialization } from '../../../lib/types';
import { PapersService } from '../../../services/papers.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-paper-assign',
  templateUrl: './paper-assign.component.html',
  styleUrls: ['./paper-assign.component.scss'],
  standalone: false
})
export class PaperAssignComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly committeesService: CommitteesService,
    private readonly papersService: PapersService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private readonly destroyRef: DestroyRef,
  ) {}

  committeeId: number;
  committee: Committee;
  memberIds: number[]; // Array to keep member IDs, used to not allow papers from a teacher that is in this committee
  isMasterCommittee: boolean = false;
  specializations: Specialization[];

  isLoadingCommittee: boolean = true;
  isLoadingAssignedPapers: boolean;
  isLoadingOtherPapers: boolean;

  assignedPappers: Paper[] = [];
  otherPapers: Paper[] = [];
  changesMade: boolean = false;

  paperFilter = new FormGroup({
    title: new FormControl(''),
    type: new FormControl(null),
    specializationId: new FormControl(null),
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
        return this.committeesService.findOne(this.committeeId);
      }),
      map(committee => {
        if(!committee) {
          throw "COMMITTEE_NOT_FOUND";
        }
        return committee;
      }),
      catchError((err) => {
        console.error("Error loading committee for paper assignment:", err);
        this.router.navigate(['admin', 'committees']);
        return of(null);
      })
    ).subscribe(committee => {
      this.committee = committee;
      this.memberIds = this.committee.members.map(m => m.teacherId);
      this.isMasterCommittee = this.committee.domains.some(d => d.type == 'master');
      this.isLoadingCommittee = false;
      this.specializations = this.committee.domains.flatMap(d => d.specializations || []);
      this.getLeftPapers();
      this.getRightPapers();
    });
  }

  private async getLeftPapers() {
    this.isLoadingAssignedPapers = true;
    try {
      const result = await firstValueFrom(
        this.papersService.findAll({ assignedTo: this.committeeId, minified: true, limit: 100 })
      );
      this.assignedPappers = result.rows;
    } catch {
      this.assignedPappers = [];
    } finally {
      this.isLoadingAssignedPapers = false;
    }
  }

  private getRightPapers() {
    const filterChanges = this.paperFilter.valueChanges.pipe(debounceTime(500));
    filterChanges.pipe(
      startWith({}),
      switchMap(() => {
        this.isLoadingOtherPapers = true;
        return this.papersService.findAll({
          assigned: false,
          forCommittee: this.committeeId,
          submitted: true,
          minified: true,
          limit: 100,
          validity: 'not_invalid',
          ...this.paperFilter.value,
        }).pipe(catchError(() => of({ rows: [] })));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(papers => {
      this.otherPapers = papers.rows;
      this.isLoadingOtherPapers = false;
    });
  }

  teacherIsInCommittee(teacherId: number): boolean {
    return this.memberIds.includes(teacherId);
  }

  async saveChanges(): Promise<void> {
    const paperIds = this.assignedPappers.map(paper => paper.id);
    await firstValueFrom(this.committeesService.setPapers(this.committeeId, paperIds));
    this.snackbar.open("Modificări salvate.");
    this.changesMade = false;
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
