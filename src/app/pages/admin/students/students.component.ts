import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { UserData } from 'src/app/services/auth.service';
import { StudentDialogComponent } from 'src/app/shared/dialogs/new-student-dialog/student-dialog.component';
import { StudentsBulkAddDialogComponent } from 'src/app/shared/dialogs/students-bulk-add-dialog/students-bulk-add-dialog.component';

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

  performedActions: BehaviorSubject<string> = new BehaviorSubject(''); // put in merge to force update after student edit


  constructor(private admin: AdminService, private dialog: MatDialog, private snackbar: MatSnackBar) { }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.performedActions)
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

  openNewStudentDialog() {
    let dialogRef = this.dialog.open(StudentDialogComponent, {
      data: {
        mode: "create"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.subscribe(res => {
          if (res) {
            this.snackbar.open("Student adăugat.");
            this.performedActions.next("studentAdded");
          } else {
            this.snackbar.open("A apărut o eroare.");
          }
        })
      }
    });
  }

  viewStudent(studentId: number) {
    let dialogRef = this.dialog.open(StudentDialogComponent, {
      data: {
        mode: "view",
        data: this.data.find(student => student.id == studentId)
      }
    });

  }

  editStudent(studentId: number) {
    let dialogRef = this.dialog.open(StudentDialogComponent, {
      data: {
        mode: "edit",
        data: this.data.find(student => student.id == studentId)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.subscribe(res => {
          if (res) {
            this.snackbar.open("Student editat.");
            this.performedActions.next("studentEdited");
          } else {
            this.snackbar.open("A apărut o eroare.");
          }
        })
      }
    })

  }

  refreshResults() {
    this.performedActions.next("refresh");
  }

  bulkAddStudents() {
    const dialogRef = this.dialog.open(StudentsBulkAddDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.performedActions.next("bulkAdd");
      }
    })
  }

}

