import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, merge, Observable, of as observableOf, Subscription } from 'rxjs';
import { catchError, debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { StudentDialogComponent } from '../../dialogs/new-student-dialog/student-dialog.component';
import { StudentDeleteDialogComponent } from '../../dialogs/student-delete-dialog/student-delete-dialog.component';
import { StudentsBulkAddDialogComponent } from '../../dialogs/students-bulk-add-dialog/students-bulk-add-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { AuthService, Domain, UserData } from '../../../services/auth.service';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { rowAnimation } from '../../../row-animations';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss'],
  animations: [
    rowAnimation,
  ]
})
export class AdminStudentsComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private admin: AdminService, private auth: AuthService, private router: Router,
    private dialog: MatDialog, private snackbar: MatSnackBar) { }

  user: UserData;
  userSubscription: Subscription;

  ngOnInit(): void {
    this.userSubscription = this.auth.userData.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  displayedColumns: string[] = ['status', 'id', 'lastName', 'firstName', 'domain', 'group', 'promotion', 'email', 'actions'];
  data: UserData[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  domains: Domain[];

  studentFilter = new FormGroup({
    domainId: new FormControl(null),
    specializationId: new FormControl({ value: null, disabled: true }),
    group: new FormControl(null),
    promotion: new FormControl(null),
    email: new FormControl(null)
  });

  showFilters = false;

  DOMAIN_TYPES = DOMAIN_TYPES;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  performedActions: BehaviorSubject<string> = new BehaviorSubject(''); // put in merge to force update after student edit


  ngAfterViewInit() {
    const filterChanges = this.studentFilter.valueChanges.pipe(debounceTime(500));
    merge(this.sort.sortChange, filterChanges).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, filterChanges, this.performedActions)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          const filters = this.studentFilter.value as any;
          return this.admin.getStudentUsers(
            this.sort.active, this.sort.direction.toUpperCase(), this.paginator.pageIndex, this.paginator.pageSize, filters);
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

    this.admin.getDomains().subscribe(domains => this.domains = domains);
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

  async viewStudent(user: UserData) {
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

  async editStudent(user: UserData) {
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

  async deleteStudent(user: UserData) {
    let dialogRef = this.dialog.open(StudentDeleteDialogComponent, {
      data: user,
    });
    const deleteObservable = await firstValueFrom(dialogRef.afterClosed());
    if(!deleteObservable) return;
    if(await firstValueFrom(deleteObservable)) {
      this.performedActions.next("studentDeleted");
      this.snackbar.open("Studentul a fost șters.");
    }
  }

  async resendActivationCode(student: UserData) {
    const result = await firstValueFrom(this.admin.resendUserActivationCode(student.id));
    if(result) {
      this.snackbar.open("Link de activare trimis.");
    }
  }

  async impersonateStudent(student: UserData) {
    const result = await firstValueFrom(this.auth.impersonateUser(student.id));
    if(!result.error) {
      this.router.navigate(['student']);
    }
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

  get domainSpecializations() {
    const domainId = this.studentFilter.get("domainId").value;
    if(!domainId) return [];
    const domain = this.domains.find(domain => domain.id == domainId);
    return domain.specializations;
  }

  handleFilterDomainChange(value: number) {
    const specializationControl = this.studentFilter.get("specializationId");
    if(value) {
      specializationControl.setValue(null);
      specializationControl.enable();
    } else {
      specializationControl.disable();
    }
  }

  toggleFilters() {
    if(this.showFilters) {
      if(this.studentFilter.dirty) {
        this.studentFilter.reset();
      }
    }
    this.showFilters = !this.showFilters;
  }

}

