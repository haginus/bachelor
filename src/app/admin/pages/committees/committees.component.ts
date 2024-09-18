import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommitteeDialogComponent } from '../../dialogs/committee-dialog/committee-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { CommitteeDocument, CommitteeDocumentsFormat, DocumentService } from '../../../services/document.service';
import { AuthService, Committee, Domain, UserData, UserDataMin } from '../../../services/auth.service';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { rowAnimation } from '../../../row-animations';

@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
  animations: [
    rowAnimation,
  ]
})
export class CommitteesComponent implements OnInit, OnDestroy {

  constructor(private admin: AdminService, private dialog: MatDialog, private document: DocumentService,
    private auth: AuthService, private snackbar: MatSnackBar) { }

  displayedColumns: string[] = ['status', 'id', 'name', 'domains', 'locationAndTime', 'president', 'secretary', 'members', 'paperNumber', 'actions'];
  resultsLength: number;
  isLoadingResults: boolean = true;
  isError: boolean = false;
  data: CommitteeRow[];
  committees: Committee[] = [];

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');
  user: UserData;
  userSubscription: Subscription;

  ngOnInit(): void {
    this.performedActions.pipe(
      switchMap(action => {
        this.isLoadingResults = true;
        return this.admin.getCommittees();
      })
    ).subscribe(data => {
      this.committees = data;
      this.isLoadingResults = false;
      this.mapResult();
    });
    this.userSubscription = this.auth.userData.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  private mapResult() {
    this.data = this.committees.map(committee => {
      const president = committee.members.find(member => member.role == 'president')?.user;
      const secretary = committee.members.find(member => member.role == 'secretary')?.user;
      const members = committee.members.filter(member => member.role == 'member').map(member => member.user);
      const paperNumber = committee.papers.length;
      return {...committee, president, secretary, members, committee: committee, paperNumber };
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

  editCommittee(id: number) {
    const dialogDef = this.dialog.open(CommitteeDialogComponent, {
      data: {
        mode: 'edit',
        data: this.committees.find(committee => committee.id == id)
      }
    });
    dialogDef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next('editCommittee');
      }
    })
  }

  deleteCommittee(id: number) {
    const dialogDef = this.dialog.open(CommitteeDialogComponent, {
      data: {
        mode: 'delete',
        data: this.committees.find(committee => committee.id == id)
      }
    });
    dialogDef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next('deleteCommittee');
      }
    })
  }

  markFinalGrades(id: number, finalGrades = true) {
    this.admin.markCommitteeFinalGrades(id, finalGrades).subscribe(result => {
      if(result) {
        const marked = finalGrades ? 'marcate' : 'demarcate';
        this.snackbar.open(`Note ${marked} drept finale.`);
        this.performedActions.next('markFinalGrades');
      }
    });
  }

  getCommitteeDocument(committee: Committee, documentName: CommitteeDocument) {
    let sbRef = this.snackbar.open('Se generează documentul...');
    this.document.getCommitteeDocument(committee.id, documentName).subscribe(document => {
      const [mimeType, title] = CommitteeDocumentsFormat[documentName];
      const documentTitle = [committee.name, title].join(' - ');
      if(mimeType === 'application/pdf') {
        this.document.viewDocument(document, mimeType, documentTitle);
      } else {
        this.document.downloadDocument(document, documentTitle, mimeType);
      }
      sbRef.dismiss();
    });
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
  id: number,
  name: string,
  domains: Domain[],
  paperNumber: number,
  president: UserDataMin,
  secretary: UserDataMin,
  members: UserDataMin[],
  committee: Committee // original committee
}
