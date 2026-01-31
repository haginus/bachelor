import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommitteeDialogComponent } from '../../dialogs/committee-dialog/committee-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { rowAnimation } from '../../../row-animations';
import { CommitteeFile, CommitteeFilesFormat, CommitteesService } from '../../../services/committees.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User, Teacher, Committee } from '../../../lib/types';

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
    private admin: AdminService,
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

  async generateCommitteeDocument(documentName: 'committee_compositions' | 'committee_students' | 'committee_students_excel') {
    const documentFormats: Record<typeof documentName, [string, string]> = {
      committee_compositions: ['application/pdf', 'Componența comisiilor și planificarea pe săli și zile'],
      committee_students: ['application/pdf', 'Repartizare comisii'],
      committee_students_excel: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Repartizare comisii']
    }
    let sbRef = this.snackbar.open('Se generează documentul...', null, {
      duration: null
    });
    const document = await firstValueFrom(this.admin.generateCommitteeDocument(documentName));
    if(!document) return;
    sbRef.dismiss();
    const [mimeType, title] = documentFormats[documentName];
    if(mimeType === 'application/pdf') {
      this.document.viewDocument(document, mimeType, title);
    } else {
      this.document.downloadDocument(document, title, mimeType);
    }
  }

}

interface CommitteeRow {
  president?: Teacher;
  secretary?: Teacher;
  members: Teacher[];
  paperNumber: number;
  committee: Committee;
}
