import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { Committee, Domain, Paper, UserDataMin } from 'src/app/services/auth.service';
import { CommitteeDocument, DocumentService } from 'src/app/services/document.service';
import { CommonDialogComponent } from 'src/app/shared/common-dialog/common-dialog.component';
import { CommitteeDialogComponent } from '../../dialogs/committee-dialog/committee-dialog.component';

@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss']
})
export class CommitteesComponent implements OnInit {

  constructor(private admin: AdminService, private dialog: MatDialog, private document: DocumentService,
    private snackbar: MatSnackBar) { }

  displayedColumns: string[] = ['name', 'domains', 'president', 'secretary', 'members', 'paperNumber', 'actions'];
  resultsLength: number;
  isLoadingResults: boolean = true;
  isError: boolean = false;
  data: CommitteeRow[];
  committees: Committee[] = [];

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');

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
    })
    
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

  getCommitteeDocument(committeeId: number, documentName: CommitteeDocument) {
    let sbRef = this.snackbar.open('Se generează documentul...');
    this.document.getCommitteeDocument(committeeId, documentName).subscribe(document => {
      this.document.viewDocument(document, 'application/pdf');
      sbRef.dismiss();
    });
  }

  autoAssign() {
    const dialogDef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: 'Atribuire automată lucrări',
        content: 'Folosiți această funcție pentru a atribui automat lucrările de licență care nu sunt încă atrubuite unei comisii.',
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

  generateCommitteeDocument(documentName: 'committee_compositions' | 'committee_students') {
    let sbRef = this.snackbar.open('Se generează documentul...', null, {
      duration: null
    });
    this.admin.generateCommitteeDocument(documentName).subscribe(doc => {
      if(doc) {
        this.document.viewDocument(doc, 'application/pdf');
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
