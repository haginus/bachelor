import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { AdminsService } from '../../../services/admins.service';
import { User } from '../../../lib/types';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-edit-dialog',
  templateUrl: './admin-edit-dialog.component.html',
  styleUrls: ['./admin-edit-dialog.component.scss'],
  standalone: false
})
export class AdminEditDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AdminEditDialogData,
    private auth: AuthService,
    private adminsService: AdminsService,
    private dialog: MatDialogRef<AdminEditDialogComponent>,
    private readonly snackBar: MatSnackBar,
  ) { }

  adminForm = new FormGroup({
    'firstName': new FormControl(this.data.user?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.user?.lastName, [Validators.required]),
    'email': new FormControl({ value: this.data.user?.email, disabled: true }, [Validators.email, Validators.required]),
    'type': new FormControl<'admin' | 'secretary'>(this.data.user?.type as any || 'admin', [Validators.required]),
  });
  isLoading: boolean = false;

  ngOnInit(): void {
    if(this.data.mode == 'create') {
      this.adminForm.get('email').enable();
    }
  }

  async saveUser() {
    if(!await firstValueFrom(this.auth.enterSudoMode())) return;
    const dto = this.adminForm.getRawValue();
    this.isLoading = true;
    try {
      const result = this.data.mode == 'create'
        ? await firstValueFrom(this.adminsService.create(dto))
        : await firstValueFrom(this.adminsService.update(this.data.user!.id, dto));
      this.dialog.close(result);
      this.snackBar.open('Utilizatorul a fost salvat.');
    } finally {
      this.isLoading = false;
    }
  }

}

export interface AdminEditDialogData {
  mode: "create" | "edit";
  user?: User;
}
