import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { UserData } from 'src/app/services/auth.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class AdminStudentsComponent implements OnInit, AfterViewInit {


  ngOnInit(): void {
  }

  displayedColumns: string[] = ['id', 'lastName', 'firstName', 'domain', 'group', 'email', 'actions'];
  data: UserData[] = [];
  
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(private admin: AdminService) { }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.admin.getStudentUsers(
            this.sort.active, this.sort.direction.toUpperCase(), this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.count;

          return data.rows;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }
}
