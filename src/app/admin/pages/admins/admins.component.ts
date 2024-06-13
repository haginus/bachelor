import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, merge, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AdminEditDialogComponent, AdminEditDialogData } from '../../dialogs/admin-edit-dialog/admin-edit-dialog.component';
import { AdminService } from '../../../services/admin.service';
import { AuthService, UserData } from '../../../services/auth.service';
import { USER_TYPES } from '../../../lib/constants';
import { CommonDialogComponent, CommonDialogData } from '../../../shared/common-dialog/common-dialog.component';
import { rowAnimation } from '../../../row-animations';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss'],
  animations: [
    rowAnimation,
  ]
})
export class AdminsComponent implements OnInit {

  constructor(private admin: AdminService, private auth: AuthService, private router: Router,
    private dialog: MatDialog, private snackbar: MatSnackBar) { }

  USER_TYPES = USER_TYPES;

  displayedColumns: string[] = ['id', 'lastName', 'firstName', 'email', 'type', 'actions'];
  data: UserData[] = [];
  currentUser: UserData;

  dataSubscription: Subscription;
  userSubscription: Subscription;

  isLoadingResults = true;

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');


  ngOnInit(): void {
    this.dataSubscription = combineLatest([this.auth.enterSudoMode(), this.performedActions])
      .pipe(
        switchMap(([password]) => {
          if(!password) return of([]);
          this.isLoadingResults = true;
          return this.admin.getAdminUsers();
        }),
        map(data => {
          this.isLoadingResults = false;
          return data;
        }),
      )
      .subscribe(data => this.data = data);

    this.userSubscription = this.auth.userData.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  refreshResults() {
    this.performedActions.next('refresh');
  }

  addUser() {
    const dialogRef = this.dialog.open<AdminEditDialogComponent, AdminEditDialogData, UserData>(AdminEditDialogComponent, {
      data: { mode: 'create' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next('addUser');
        this.snackbar.open("Utilizator creat.");
      }
    });
  }

  editUser(user: UserData) {
    const dialogRef = this.dialog.open<AdminEditDialogComponent, AdminEditDialogData, UserData>(AdminEditDialogComponent, {
      data: { mode: 'edit', data: user }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.performedActions.next('editUser');
        this.snackbar.open("Utilizator modificat.");
      }
    });
  }

  resendActivationCode(user: UserData) {
    this.admin.resendUserActivationCode(user.id).subscribe(result => {
      if(result) {
        this.snackbar.open("Link de activare trimis.");
      }
    });
  }

  impersonateUser(user: UserData) {
    this.auth.impersonateUser(user.id).subscribe(result => {
      if(!result.error) {
        this.router.navigate(['admin']);
      }
    });
  }

  deleteUser(user: UserData) {
    let dialogRef = this.dialog.open<CommonDialogComponent, CommonDialogData, string>(CommonDialogComponent, {
      data: {
        title: 'Ștergeți utilizatorul?',
        content: `Acesta va pierde imediat accesul în platformă. Doriți să continuați?`,
        actions: [
          { name: 'Anulați', value: 'dismiss' },
          { name: 'Ștergeți', value: 'delete' },
        ]
      }
    });
    let sub = dialogRef.afterClosed().subscribe(result => {
      if(result == 'delete') {
        this.admin.deleteUser(user.id).subscribe(result => {
          if(result) {
            this.snackbar.open("Utilizator șters.");
            this.performedActions.next('deleteUser');
          }
        });
      }
      sub.unsubscribe();
    });
  }



}
