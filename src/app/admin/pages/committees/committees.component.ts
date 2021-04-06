import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { Domain, Paper, UserDataMin } from 'src/app/services/auth.service';
import { CommitteeDialogComponent } from '../../dialogs/committee-dialog/committee-dialog.component';

@Component({
  selector: 'app-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss']
})
export class CommitteesComponent implements OnInit {

  constructor(private admin: AdminService, private dialog: MatDialog) { }

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

  refreshResults() {
    this.performedActions.next("refresh");
  }

}

export interface Committee {
  id: number,
  name: string,
  domains: Domain[],
  members: CommitteeMember[],
  papers: Paper[]
}

export interface CommitteeMember {
  teacherId: number,
  role: 'president' | 'secretary' | 'member',
  user?: UserDataMin
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
