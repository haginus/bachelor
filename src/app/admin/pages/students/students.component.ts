import { afterNextRender, AfterViewInit, Component, DestroyRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, merge, of as observableOf, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, filter, map, startWith, switchMap } from 'rxjs/operators';
import { StudentDialogComponent } from '../../dialogs/new-student-dialog/student-dialog.component';
import { StudentDeleteDialogComponent } from '../../dialogs/student-delete-dialog/student-delete-dialog.component';
import { StudentImportDialogComponent } from '../../dialogs/student-import-dialog/student-import-dialog.component';
import { AuthService } from '../../../services/auth.service';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { rowAnimation } from '../../../row-animations';
import { Domain, Student, User } from '../../../lib/types';
import { StudentsService } from '../../../services/students.service';
import { DomainsService } from '../../../services/domains.service';
import { UsersService } from '../../../services/users.service';
import { PaginatedResolverResult } from '../../../lib/resolver-factory';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { removeEmptyProperties } from '../../../lib/utils';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  animations: [
    rowAnimation,
  ],
  standalone: false
})
export class AdminStudentsComponent {

  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private domainsService: DomainsService,
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    this.auth.userData.pipe(takeUntilDestroyed()).subscribe(user => {
      this.user = user;
    });
    this.domainsService.findAll().pipe(takeUntilDestroyed()).subscribe(domains => {
      this.domains = domains;
    });
    this.route.data.pipe(takeUntilDestroyed()).subscribe(data => {
      this.resolverData = data['resolverData'];
    });
    afterNextRender(() => {
      this.studentFilter.patchValue(this.resolverData.params, { emitEvent: false });
      this.studentFilterDebounced.patchValue(this.resolverData.params, { emitEvent: false });
      const filterValue = this.getFilterValue();
      if(filterValue.domainId) {
        this.studentFilter.get("specializationId").enable();
      } else {
        this.studentFilter.get("specializationId").disable();
      }
      if(Object.keys(removeEmptyProperties(filterValue)).length > 0) {
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
            ...removeEmptyProperties(filterValue),
          },
        });
      });

      const filterValueChanges = merge(
        this.studentFilter.valueChanges,
        this.studentFilterDebounced.valueChanges.pipe(debounceTime(500)),
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

  user: User;

  resolverData!: PaginatedResolverResult<Student, ReturnType<typeof this.getFilterValue> & { sortBy?: string; sortDirection?: 'asc' | 'desc' }>;
  displayedColumns: string[] = ['status', 'id', 'lastName', 'firstName', 'domain', 'group', 'promotion', 'email', 'actions'];

  domains: Domain[] = [];

  studentFilter = new FormGroup({
    domainId: new FormControl<number | undefined>(undefined, { nonNullable: true }),
    specializationId: new FormControl<number | undefined>(undefined, { nonNullable: true }),
  });

  studentFilterDebounced = new FormGroup({
    group: new FormControl<string | undefined>(undefined, { nonNullable: true }),
    promotion: new FormControl<string | undefined>(undefined, { nonNullable: true }),
    lastName: new FormControl<string | undefined>(undefined, { nonNullable: true }),
    firstName: new FormControl<string | undefined>(undefined, { nonNullable: true }),
    email: new FormControl<string | undefined>(undefined, { nonNullable: true }),
  });

  showFilters = false;

  DOMAIN_TYPES = DOMAIN_TYPES;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  performedActions: Subject<string> = new Subject();

  getFilterValue() {
    return { ...this.studentFilter.value, ...this.studentFilterDebounced.value };
  }

  resetFilters() {
    this.studentFilter.reset();
    this.studentFilterDebounced.reset();
  }

  async openNewStudentDialog() {
    let dialogRef = this.dialog.open(StudentDialogComponent, {
      data: {
        mode: "create"
      }
    });
    if(await firstValueFrom(dialogRef.afterClosed())) {
      this.performedActions.next("studentAdded");
    }
  }

  async viewStudent(user: User) {
    const dialogRef = this.dialog.open(StudentDialogComponent, {
      data: {
        mode: "view",
        user,
      }
    });
    if(await firstValueFrom(dialogRef.afterClosed())) {
      this.performedActions.next("studentEdited");
    }
  }

  async editStudent(user: User) {
    let dialogRef = this.dialog.open(StudentDialogComponent, {
      data: {
        mode: "edit",
        user,
      }
    });
    if(await firstValueFrom(dialogRef.afterClosed())) {
      this.performedActions.next("studentEdited");
    }
  }

  async deleteStudent(user: User) {
    let dialogRef = this.dialog.open(StudentDeleteDialogComponent, {
      data: user,
    });
    const deleteObservable = await firstValueFrom(dialogRef.afterClosed());
    if(!deleteObservable) return;
    try {
      await firstValueFrom(deleteObservable);
      this.performedActions.next("studentDeleted");
      this.snackbar.open("Studentul a fost șters.");
    } catch(err) {}
  }

  async resendActivationCode(student: User) {
    await firstValueFrom(this.usersService.sendActivationEmail(student.id));
    this.snackbar.open("Link de activare trimis.");
  }

  async impersonateStudent(student: User) {
    const result = await firstValueFrom(this.auth.impersonateUser(student.id));
    if(!result.error) {
      this.router.navigate(['student']);
    }
  }

  refreshResults() {
    this.performedActions.next("refresh");
  }

  bulkAddStudents() {
    const dialogRef = this.dialog.open(StudentImportDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.performedActions.next("bulkAdd");
      }
    })
  }

  get domainSpecializations() {
    const domainId = this.studentFilter.get("domainId").value;
    if(!domainId) return [];
    const domain = this.domains.find(domain => domain.id == domainId);
    return domain?.specializations || [];
  }

  handleFilterDomainChange(value: number) {
    const specializationControl = this.studentFilter.get("specializationId");
    if(value) {
      specializationControl.setValue(undefined);
      specializationControl.enable();
    } else {
      specializationControl.disable();
    }
  }

  toggleFilters() {
    if(this.showFilters) {
      this.resetFilters();
    }
    this.showFilters = !this.showFilters;
  }

}

