import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject, catchError, map, Observable, of, take } from "rxjs";
import { SudoDialogComponent } from "../admin/dialogs/sudo-dialog/sudo-dialog.component";

@Injectable({
  providedIn: 'any'
})
export class SudoService {

  sudoPasswordSource: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  private readonly dialog = inject(MatDialog);

  enterSudoMode(): Observable<string> {
    const password = this.sudoPasswordSource.value;
    if(password) return of(password);
    const dialogRef = this.dialog.open<SudoDialogComponent, never, string>(SudoDialogComponent);
    return dialogRef.afterClosed().pipe(
      take(1),
      map(password => {
        if(password) {
          this.sudoPasswordSource.next(password);
          return password;
        } else {
          throw { error: { message: "Ați renunțat la intrarea în modul sudo." } };
        }
      }),
      catchError(() => of(null))
    );
  }
}
