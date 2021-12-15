import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { UserData } from 'src/app/services/auth.service';
import { AdminTeacherBulkAddDialogComponent } from '../../dialogs/teacher-bulk-add-dialog/teacher-bulk-add-dialog.component';
import { AdminTeacherDeleteDialogComponent } from '../../dialogs/teacher-delete-dialog/teacher-delete-dialog.component';
import { AdminTeacherDialogConmonent } from '../../dialogs/teacher-dialog/teacher-dialog.component';

@Component({
  selector: 'app-admin-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss']
})
export class AdminTeachersComponent implements OnInit, AfterViewInit {

  constructor(private admin: AdminService, private dialog: MatDialog, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
  }

  displayedColumns: string[] = ['status', 'id', 'lastName', 'firstName', 'email', 'actions'];
  data: UserData[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  performedActions: BehaviorSubject<string> = new BehaviorSubject(''); // put in merge to force update after student edit



  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.performedActions)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.admin.getTeacherUsers(
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
          return of([]);
        })
      ).subscribe(data => this.data = data);
  }

  addTeacher() {
    let dialogRef = this.dialog.open(AdminTeacherDialogConmonent, {
      data: {
        mode: "create"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.subscribe(res => {
          if (res) {
            this.snackbar.open("Profesor adăugat.");
            this.performedActions.next("teacherAdded");
          }
        })
      }
    });
  }

  viewTeacher(studentId: number) {
    let dialogRef = this.dialog.open(AdminTeacherDialogConmonent, {
      data: {
        mode: "view",
        data: this.data.find(student => student.id == studentId)
      }
    });

  }

  editTeacher(studentId: number) {
    let dialogRef = this.dialog.open(AdminTeacherDialogConmonent, {
      data: {
        mode: "edit",
        data: this.data.find(student => student.id == studentId)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.subscribe(res => {
          if (res) {
            this.snackbar.open("Profesor editat.");
            this.performedActions.next("teacherEdited");
          }
        })
      }
    })
  }

  deleteTeacher(studentId: number) {
    let dialogRef = this.dialog.open(AdminTeacherDeleteDialogComponent, {
      data: this.data.find(student => student.id == studentId)
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.subscribe(res => {
          if (res != null) {
            this.snackbar.open("Profesor șters.");
            this.performedActions.next("teacherDeleted");
          } 
        })
      }
    })
  }

  refreshResults() {
    this.performedActions.next("refresh");
  }

  bulkAddTeachers() {
    const dialogRef = this.dialog.open(AdminTeacherBulkAddDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.performedActions.next("bulkAdd");
      }
    })
  }


}
