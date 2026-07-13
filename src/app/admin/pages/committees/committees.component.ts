import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommitteeDialogComponent } from '../../dialogs/committee-dialog/committee-dialog.component';
import { AuthService } from '../../../services/auth.service';
import { rowAnimation } from '../../../row-animations';
import { CommitteeFile, CommitteesService } from '../../../services/committees.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User, Teacher, Committee } from '../../../lib/types';
import { ReportFile, ReportsService } from '../../../services/reports.service';
import { FilesService } from '../../../services/files.service';
import { PaperAutoAssignDialogComponent } from '../../dialogs/paper-auto-assign-dialog/paper-auto-assign-dialog.component';

@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
  animations: [
    rowAnimation,
  ],
  standalone: false
})
export class CommitteesComponent {

  constructor(
    private committeesService: CommitteesService,
    private readonly reportsService: ReportsService,
    private dialog: MatDialog,
    private filesService: FilesService,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) {
    this.performedActions.pipe(
      takeUntilDestroyed(),
      switchMap(() => {
        this.isLoadingResults = true;
        return this.committeesService.findAll();
      }),
    ).subscribe((committees) => {
      this.committees = committees;
      this.isLoadingResults = false;
      this.mapResult();
    });
    this.auth.userData.pipe(
      takeUntilDestroyed()
    ).subscribe(user => {
      this.user = user;
    });
  }

  displayedColumns: string[] = ['status', 'id', 'name', 'domains', 'locationAndTime', 'president', 'secretary', 'members', 'paperNumber', 'actions'];
  resultsLength: number;
  isLoadingResults: boolean = true;
  isError: boolean = false;
  data: CommitteeRow[];
  committees: Committee[] = [];

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');
  user: User;

  private mapResult() {
    this.data = this.committees.map(committee => {
      const president = committee.members.find(member => member.role == 'president')?.teacher;
      const secretary = committee.members.find(member => member.role == 'secretary')?.teacher;
      const members = committee.members.filter(member => member.role == 'member').map(member => member.teacher);
      const paperNumber = committee.papers.length;
      return { president, secretary, members, paperNumber, committee };
    });
  }

  addCommittee() {
    const dialogDef = this.dialog.open(CommitteeDialogComponent, {
      data: {
        mode: 'create'
      }
    });
    dialogDef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next('addCommittee');
      }
    })
  }

  async editCommittee(committee: Committee) {
    const dialogDef = this.dialog.open(CommitteeDialogComponent, {
      data: {
        mode: 'edit',
        data: committee,
      }
    });
    const result = await firstValueFrom(dialogDef.afterClosed());
    if(result) {
      this.performedActions.next('editCommittee');
    }
  }

  async deleteCommittee(committee: Committee) {
    const dialogDef = this.dialog.open(CommitteeDialogComponent, {
      data: {
        mode: 'delete',
        data: committee
      }
    });
    const result = await firstValueFrom(dialogDef.afterClosed());
    if(result) {
      this.performedActions.next('deleteCommittee');
    }
  }

  async markFinalGrades(id: number, finalGrades = true) {
    await firstValueFrom(this.committeesService.markGradesFinal(id, finalGrades));
    const marked = finalGrades ? 'marcate' : 'demarcate';
    this.snackbar.open(`Note ${marked} drept finale.`);
    this.performedActions.next('markFinalGrades');
  }

  async getCommitteeDocument(committee: Committee, fileName: CommitteeFile) {
    const document = await firstValueFrom(this.committeesService.getFile(committee.id, fileName));
    this.filesService.viewOrSaveFile(document);
  }

  async autoAssign() {
    const dialogDef = this.dialog.open(PaperAutoAssignDialogComponent);
    if(!await firstValueFrom(dialogDef.afterClosed())) return;
    this.refreshResults();
  }

  refreshResults() {
    this.performedActions.next("refresh");
  }

  async openReportFile(fileName: ReportFile) {
    return this.reportsService.openFile(fileName);
  }

}

interface CommitteeRow {
  president?: Teacher;
  secretary?: Teacher;
  members: Teacher[];
  paperNumber: number;
  committee: Committee;
}
