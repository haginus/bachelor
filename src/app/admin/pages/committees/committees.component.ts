import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService, Committee, Domain, Paper, UserData, UserDataMin } from 'src/app/services/auth.service';
import { CommitteeDocument, CommitteeDocumentsFormat, DocumentService } from 'src/app/services/document.service';
import { CommonDialogComponent } from 'src/app/shared/common-dialog/common-dialog.component';
import { CommitteeDialogComponent } from '../../dialogs/committee-dialog/committee-dialog.component';

@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss']
})
export class CommitteesComponent implements OnInit, OnDestroy {

  constructor(private admin: AdminService, private dialog: MatDialog, private document: DocumentService,
    private auth: AuthService, private snackbar: MatSnackBar) { }

  displayedColumns: string[] = ['status', 'id', 'name', 'domains', 'president', 'secretary', 'members', 'paperNumber', 'actions'];
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
      const format = CommitteeDocumentsFormat[documentName];
      if(format[0] == 'pdf') {
        this.document.viewDocument(document, format[1]);
      } else {
        this.document.downloadDocument(document, `Catalog ${committee.name}.${format[0]}`, format[1]);
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

  generateCommitteeDocument(documentName: 'committee_compositions' | 'committee_students' | 'committee_students_excel') {
    let sbRef = this.snackbar.open('Se generează documentul...', null, {
      duration: null
    });
    this.admin.generateCommitteeDocument(documentName).subscribe(doc => {
      if(doc) {
        if(documentName == 'committee_students_excel') {
          this.document.downloadDocument(doc, 'Repartizare comisii.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } else {
          this.document.viewDocument(doc, 'application/pdf');
        }
        sbRef.dismiss();
      }
    })
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
