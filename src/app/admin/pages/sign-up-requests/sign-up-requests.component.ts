import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DOMAIN_TYPES } from 'src/app/lib/constants';
import { AdminService } from 'src/app/services/admin.service';
import { SignUpRequest } from 'src/app/services/auth.service';
import { SignUpRequestDialogComponent } from '../../dialogs/sign-up-request-dialog/sign-up-request-dialog.component';

@Component({
  selector: 'app-sign-up-requests',
  templateUrl: './sign-up-requests.component.html',
  styleUrls: ['./sign-up-requests.component.scss']
})
export class SignUpRequestsComponent implements OnInit {

  constructor(private admin: AdminService, private dialog: MatDialog) { }

  @ViewChild('table') table: MatTable<SignUpRequest>;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<SignUpRequest>;
  isLoadingResults: boolean = true;
  displayedColumns: string[] = ['id', 'name', 'specialization', 'group', 'promotion', 'email', 'actions'];

  DOMAIN_TYPES = DOMAIN_TYPES;

  private requestSub: Subscription;

  private getRequests(): void {
    if(this.requestSub) {
      this.requestSub.unsubscribe();
    }
    this.isLoadingResults = true;
    this.requestSub = this.admin.getSignUpRequests().subscribe(requests => {
      this.dataSource.data = requests;
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([]);
    this.getRequests();
  }

  ngOnDestroy() {
    this.requestSub.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (request, property) => {
      switch (property) {
        case 'specialization': return request.specialization;
        default: return request[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  refreshResults() {
    this.getRequests();
  }

  openRequest(request: SignUpRequest) {
    this.dialog.open(SignUpRequestDialogComponent, {
      data: request
    }).afterClosed().subscribe(result => {
      if(request) this.refreshResults();
    })
  }
}
