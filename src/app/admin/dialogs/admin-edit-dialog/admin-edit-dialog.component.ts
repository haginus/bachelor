import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService, UserData } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-edit-dialog',
  templateUrl: './admin-edit-dialog.component.html',
  styleUrls: ['./admin-edit-dialog.component.scss']
})
export class AdminEditDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AdminEditDialogData, private auth: AuthService,
   private admin: AdminService, private dialog: MatDialogRef<AdminEditDialogComponent>) { }

  adminForm = new FormGroup({
    'firstName': new FormControl(this.data.data?.firstName, [Validators.required]),
    'lastName': new FormControl(this.data.data?.lastName, [Validators.required]),
    'email': new FormControl({ value: this.data.data?.email, disabled: true }, [Validators.email, Validators.required]),
    'type': new FormControl<'admin' | 'secretary'>("admin", [Validators.required]),
  });
  isLoading: boolean = false;

  ngOnInit(): void {
    if(this.data.mode == 'create') {
      this.adminForm.get('email').enable();
    }
  }

  addUser() {
    const { firstName, lastName, email, type } = this.adminForm.value;
    this.auth.enterSudoMode().subscribe(password => {
      if(!password) return;
      this.isLoading = true;
      this.admin.addAdmin(firstName, lastName, email, type).subscribe(result => {
        if(result) {
          this.dialog.close(result);
        } else {
          this.isLoading = false;
        }
      });
    });
  }

  editUser() {
    const { firstName, lastName, type } = this.adminForm.value;
    this.auth.enterSudoMode().subscribe(password => {
      if(!password) return;
      this.isLoading = true;
      this.admin.editAdmin(this.data.data!.id, firstName, lastName, type).subscribe(result => {
        if(result) {
          this.dialog.close(result);
        } else {
          this.isLoading = false;
        }
      });
    });
  }


}

export interface AdminEditDialogData {
  mode: "create" | "edit";
  data?: UserData;
}
