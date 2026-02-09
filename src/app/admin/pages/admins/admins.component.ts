import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, firstValueFrom, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AdminEditDialogComponent, AdminEditDialogData } from '../../dialogs/admin-edit-dialog/admin-edit-dialog.component';
import { AuthService } from '../../../services/auth.service';
import { USER_TYPES } from '../../../lib/constants';
import { CommonDialogComponent, CommonDialogData } from '../../../shared/components/common-dialog/common-dialog.component';
import { rowAnimation } from '../../../row-animations';
import { AdminsService } from '../../../services/admins.service';
import { User } from '../../../lib/types';
import { UsersService } from '../../../services/users.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss'],
  animations: [
    rowAnimation,
  ],
  standalone: false
})
export class AdminsComponent {

  constructor(
    private adminsService: AdminsService,
    private usersService: UsersService,
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {
    combineLatest([this.auth.enterSudoMode(), this.performedActions]).pipe(
      takeUntilDestroyed(),
      switchMap(([password]) => {
        if(!password) return of([]);
        this.isLoadingResults = true;
        return this.adminsService.findAll().pipe(catchError(() => of([])));
      }),
    ).subscribe(users => {
      this.isLoadingResults = false;
      this.users = users;
    });

    this.auth.userData.pipe(takeUntilDestroyed()).subscribe(user => {
      this.currentUser = user;
    });
  }

  USER_TYPES = USER_TYPES;

  displayedColumns: string[] = ['id', 'lastName', 'firstName', 'email', 'type', 'actions'];
  users: User[] = [];
  currentUser: User;
  isLoadingResults = true;

  performedActions: BehaviorSubject<string> = new BehaviorSubject('');

  refreshResults() {
    this.performedActions.next('refresh');
  }

  async addUser() {
    const dialogRef = this.dialog.open<AdminEditDialogComponent, AdminEditDialogData, User>(AdminEditDialogComponent, {
      data: { mode: 'create' }
    });
    if(!await firstValueFrom(dialogRef.afterClosed())) return;
    this.performedActions.next('addUser');
  }

  async editUser(user: User) {
    const dialogRef = this.dialog.open<AdminEditDialogComponent, AdminEditDialogData, User>(AdminEditDialogComponent, {
      data: { mode: 'edit', user }
    });
    if(!await firstValueFrom(dialogRef.afterClosed())) return;
    this.performedActions.next('editUser');
  }

  async resendActivationCode(user: User) {
    await firstValueFrom(this.usersService.sendActivationEmail(user.id));
    this.snackbar.open("Link de activare trimis.");
  }

  impersonateUser(user: User) {
    this.auth.impersonateUser(user.id).subscribe(result => {
      if(!result.error) {
        this.router.navigate(['admin']);
      }
    });
  }

  async deleteUser(user: User) {
    const dialogRef = this.dialog.open<CommonDialogComponent, CommonDialogData, boolean>(CommonDialogComponent, {
      data: {
        title: 'Ștergeți utilizatorul?',
        content: `Acesta va pierde imediat accesul în platformă. Doriți să continuați?`,
        actions: [
          { name: 'Anulați', value: false },
          { name: 'Ștergeți', value: true },
        ]
      }
    });
    if(!await firstValueFrom(dialogRef.afterClosed())) return;
    await firstValueFrom(this.adminsService.delete(user.id));
    this.snackbar.open('Utilizator șters.');
    this.performedActions.next('deleteUser');
  }

}
