import { afterNextRender, Component, DestroyRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, merge, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TeacherImportDialogComponent } from '../../dialogs/teacher-import-dialog/teacher-import-dialog.component';
import { AdminTeacherDeleteDialogComponent } from '../../dialogs/teacher-delete-dialog/teacher-delete-dialog.component';
import { AdminTeacherDialogComponent } from '../../dialogs/teacher-dialog/teacher-dialog.component';
import { AuthService } from '../../../services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Teacher } from '../../../lib/types';
import { UsersService } from '../../../services/users.service';
import { PaginatedResolverResult } from '../../../lib/resolver-factory';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { removeEmptyProperties } from '../../../lib/utils';

@Component({
  selector: 'app-admin-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss'],
  standalone: false
})
export class AdminTeachersComponent {

  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly usersService: UsersService,
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly snackbar: MatSnackBar,
  ) {
    this.route.data.pipe(takeUntilDestroyed()).subscribe(data => {
      this.resolverData = data['resolverData'];
    });
    afterNextRender(() => {
      this.teacherFilter.patchValue(this.resolverData.params, { emitEvent: false });
      this.teacherFilterDebounced.patchValue(this.resolverData.params, { emitEvent: false });
      if(Object.keys(removeEmptyProperties(this.getFilterValue())).length > 0) {
        this.showFilters = true;
      }
      this.performedActions.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        const filterValue = this.getFilterValue();
        this.router.navigate([], {
          relativeTo: this.route,
          replaceUrl: true,
          onSameUrlNavigation: 'reload',
          queryParams: {
            page: this.paginator.pageIndex,
            pageSize: this.paginator.pageSize,
            sortBy: this.sort.active,
            sortDirection: this.sort.direction,
            ...removeEmptyProperties({
              ...filterValue,
              onlyMissingPlagiarismReports: filterValue.onlyMissingPlagiarismReports || undefined,
            }),
          },
        });
      });

      const filterValueChanges = merge(
        this.teacherFilter.valueChanges,
        this.teacherFilterDebounced.valueChanges.pipe(debounceTime(500)),
      );

      merge(filterValueChanges, this.sort.sortChange).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.paginator.pageIndex = 0;
      });

      merge(
        filterValueChanges,
        this.sort.sortChange,
        this.paginator.page,
      ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.performedActions.next("refresh");
      });
    });
  }

  displayedColumns: string[] = ['status', 'id', 'lastName', 'firstName', 'email', 'offerCount', 'paperCount', 'plagiarismReportCount', 'actions'];
  resolverData!: PaginatedResolverResult<Teacher, { sortBy?: string; sortDirection?: 'asc' | 'desc'; lastName?: string; firstName?: string, email?: string; onlyMissingPlagiarismReports?: boolean; }>;
  showFilters = false;

  teacherFilter = new FormGroup({
    onlyMissingPlagiarismReports: new FormControl<boolean | undefined>(undefined),
  });

  teacherFilterDebounced = new FormGroup({
    lastName: new FormControl<string | undefined>(undefined),
    firstName: new FormControl<string | undefined>(undefined),
    email: new FormControl<string | undefined>(undefined),
  });

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  performedActions: Subject<string> = new Subject();

  private getFilterValue() {
    return { ...this.teacherFilter.value, ...this.teacherFilterDebounced.value };
  }

  resetFilters() {
    this.teacherFilter.reset();
    this.teacherFilterDebounced.reset();
  }

  toggleFilters() {
    if(this.showFilters) {
      this.resetFilters();
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

  viewTeacher(teacher: Teacher) {
    this.openTeacherDialog('view', teacher);
  }

  editTeacher(teacher: Teacher) {
    this.openTeacherDialog('edit', teacher);
  }

  deleteTeacher(teacher: Teacher) {
    let dialogRef = this.dialog.open(AdminTeacherDeleteDialogComponent, {
      data: teacher
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

  async resendActivationCode(teacherId: number) {
    await firstValueFrom(this.usersService.sendActivationEmail(teacherId));
    this.snackbar.open("Link de activare trimis.");
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
    const dialogRef = this.dialog.open(TeacherImportDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.performedActions.next("bulkAdd");
      }
    })
  }
}
