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
import { AdminTeacherDialogComponent } from '../../dialogs/teacher-dialog/teacher-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { AuthService, UserData } from '../../../services/auth.service';
import { rowAnimation } from '../../../row-animations';
import { FormControl, FormGroup } from '@angular/forms';
import { TeachersService } from '../../../services/teachers.service';
import { Teacher } from '../../../lib/types';

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
    private teachersService: TeachersService,
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

  data: Teacher[] = [];
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
          return this.teachersService.findAll({
            limit: this.paginator.pageSize,
            offset: this.paginator.pageIndex * this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDirection: this.sort.direction || 'asc',
            ...filterValues,
          });
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.count;

          return data.rows;
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

  openTeacherDialog(mode: 'view' | 'edit' | 'create', teacher?: Teacher) {
    const dialogRef = this.dialog.open(AdminTeacherDialogComponent, {
      data: {
        mode,
        data: teacher
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next("refresh");
      }
    });
  }

  addTeacher() {
    this.openTeacherDialog('create');
  }

  viewTeacher(teacherId: number) {
    this.openTeacherDialog('view', this.data.find(teacher => teacher.id == teacherId));
  }

  editTeacher(teacherId: number) {
    this.openTeacherDialog('edit', this.data.find(teacher => teacher.id == teacherId));
  }

  deleteTeacher(teacherId: number) {
    let dialogRef = this.dialog.open(AdminTeacherDeleteDialogComponent, {
      data: this.data.find(teacher => teacher.id == teacherId)
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.subscribe(() => {
          this.snackbar.open("Profesor șters.");
          this.performedActions.next("teacherDeleted");
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
