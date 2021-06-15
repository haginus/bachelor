import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-new-session-dialog',
  templateUrl: './new-session-dialog.component.html',
  styleUrls: ['./new-session-dialog.component.scss']
})
export class NewSessionDialogComponent implements OnInit {

  constructor(private admin: AdminService, private dialog: MatDialogRef<NewSessionDialogComponent>) { }

  actionConfirmForm = new FormGroup({
    "password": new FormControl(null, [Validators.required, Validators.minLength(6)])
  });

  isLoading = false;

  confirmAction() {
    this.isLoading = true;
    const password = this.actionConfirmForm.get("password").value;
    this.admin.beginNewSession(password).subscribe(result => {
      if(result) {
        this.dialog.close(result);
      } else {
        this.isLoading = false;
      }
    })
  }

  ngOnInit(): void {
  }

}
