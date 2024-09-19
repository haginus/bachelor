import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { SignUpRequestDialogComponent } from '../../dialogs/sign-up-request-dialog/sign-up-request-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { DocumentService } from '../../../services/document.service';
import { SignUpRequest } from '../../../services/auth.service';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { rowAnimation } from '../../../row-animations';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sign-up-requests',
  templateUrl: './sign-up-requests.component.html',
  styleUrls: ['./sign-up-requests.component.scss'],
  animations: [
    rowAnimation,
  ]
})
export class SignUpRequestsComponent implements OnInit {

  constructor(
    private readonly route: ActivatedRoute,
    private admin: AdminService,
    private dialog: MatDialog,
    private document: DocumentService,
    private snackbar: MatSnackBar
  ) {}

  @ViewChild('table') table: MatTable<SignUpRequest>;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<SignUpRequest>;
  isLoadingResults: boolean = true;
  isFirstLoad = true;
  displayedColumns: string[] = ['id', 'name', 'specialization', 'group', 'promotion', 'email', 'actions'];

  DOMAIN_TYPES = DOMAIN_TYPES;

  private async getRequests() {
    this.isLoadingResults = true;
    const firstLoadOpenId = this.route.snapshot.queryParamMap.get('id');
    const requests = await firstValueFrom(this.admin.getSignUpRequests());
    this.dataSource.data = requests;
    if(firstLoadOpenId && this.isFirstLoad) {
      const request = requests.find(request => request.id === +firstLoadOpenId);
      request && this.openRequest(request);
    }
    this.isLoadingResults = false;
    this.isFirstLoad = false;
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource([]);
    this.getRequests();
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
      if(result) this.refreshResults();
    })
  }

  downloadRequests() {
    let sbRef = this.snackbar.open('Se generează fișierul...', null, { duration: -1 });
    this.admin.getSignUpRequestsExcel().subscribe(buffer => {
      sbRef.dismiss();
      if(!buffer) return;
      this.document.downloadDocument(buffer, 'Cereri de înscriere.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  }
}
