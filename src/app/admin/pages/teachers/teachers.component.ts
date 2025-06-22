import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, of } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { AdminTeacherBulkAddDialogComponent } from '../../dialogs/teacher-bulk-add-dialog/teacher-bulk-add-dialog.component';
import { AdminTeacherDeleteDialogComponent } from '../../dialogs/teacher-delete-dialog/teacher-delete-dialog.component';
import { AdminTeacherDialogConmonent } from '../../dialogs/teacher-dialog/teacher-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { AuthService, UserData } from '../../../services/auth.service';
import { rowAnimation } from '../../../row-animations';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss'],
  animations: [
    rowAnimation,
  ]
})
export class AdminTeachersComponent implements OnInit, AfterViewInit {

  constructor(
    private admin: AdminService,
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
  }

  displayedColumns: string[] = ['status', 'id', 'lastName', 'firstName', 'email', 'offerCount', 'paperCount', 'plagiarismReportCount', 'actions'];
  showFilters = false;
  teacherFilter = new FormGroup({
    lastName: new FormControl<string | null>(null),
    firstName: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null),
    onlyMissingReports: new FormControl<boolean>(false),
  });

  data: UserDataExtented[] = [];
  resultsLength = 0;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  performedActions: BehaviorSubject<string> = new BehaviorSubject(''); // put in merge to force update after student edit

  ngAfterViewInit() {
    const filterChanges = this.teacherFilter.valueChanges.pipe(debounceTime(500));
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, filterChanges, this.performedActions)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const filterValues = this.teacherFilter.value;
          return this.admin.getTeacherUsers(
            this.sort.active,
            this.sort.direction.toUpperCase(),
            this.paginator.pageIndex,
            this.paginator.pageSize,
            filterValues,
          );
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.count;

          return data.rows as UserDataExtented[];
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return of([]);
        })
      ).subscribe(data => this.data = data);
  }

  toggleFilters() {
    if(this.showFilters) {
      if(this.teacherFilter.dirty) {
        this.teacherFilter.reset();
      }
    }
    this.showFilters = !this.showFilters;
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

  resendActivationCode(teacherId: number) {
    this.admin.resendUserActivationCode(teacherId).subscribe(result => {
      if(result) {
        this.snackbar.open("Link de activare trimis.");
      }
    });
  }

  impersonateTeacher(teacherId: number) {
    this.auth.impersonateUser(teacherId).subscribe(result => {
      if(!result.error) {
        this.router.navigate(['teacher']);
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

interface UserDataExtented extends UserData {
  teacher: {
    id: number;
    offerCount: number;
    paperCount: number;
  }
}
