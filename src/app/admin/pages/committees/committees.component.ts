import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommitteeDialogComponent } from '../../dialogs/committee-dialog/committee-dialog.component';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { rowAnimation } from '../../../row-animations';
import { CommitteeFile, CommitteeFilesFormat, CommitteesService } from '../../../services/committees.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User, Teacher, Committee } from '../../../lib/types';
import { ReportFile, ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
  animations: [
    rowAnimation,
  ]
})
export class CommitteesComponent {

  constructor(
    private committeesService: CommitteesService,
    private readonly reportsService: ReportsService,
    private dialog: MatDialog,
    private document: DocumentService,
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
    let sbRef = this.snackbar.open('Se generează documentul...');
    try {
      const document = await firstValueFrom(this.committeesService.getFile(committee.id, fileName));
      const [mimeType, title] = CommitteeFilesFormat[fileName];
      const documentTitle = [committee.name, title].join(' - ');
      if(mimeType === 'application/pdf') {
        this.document.viewDocument(document, mimeType, documentTitle);
      } else {
        this.document.downloadDocument(document, documentTitle, mimeType);
      }
    } finally {
      sbRef.dismiss();
    }
  }

  autoAssign() {
    const dialogDef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: 'Atribuire automată lucrări',
        content: 'Folosiți această funcție pentru a atribui automat lucrările de licență care nu sunt încă atribuite unei comisii.',
        actions: [
          { name: 'Anulați', value: false },
          { name: 'Atribuiți automat', value: true }
        ]
      }
    });
    dialogDef.afterClosed().subscribe(result => {
      if(result) {
        this.isLoadingResults = true;
        // TODO: add auto-assign method
        // @ts-ignore
        this.admin.autoAssignCommitteePapers().subscribe(result => {
          if(result.success) {
            this.snackbar.open(`Au fost atribuite ${result.assignedPapers} din ${result.totalPapers} lucrări.`);
          }
          this.performedActions.next('autoAssign');
        });
      }
    });
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
