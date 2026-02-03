import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-session-dialog',
  templateUrl: './new-session-dialog.component.html',
  styleUrls: ['./new-session-dialog.component.scss']
})
export class NewSessionDialogComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<NewSessionDialogComponent>
  ) {}

  actionConfirmForm = new FormGroup({
    "password": new FormControl(null, [Validators.required, Validators.minLength(6)])
  });

  isLoading = false;

  confirmAction() {
    this.isLoading = true;
    const password = this.actionConfirmForm.get("password").value;

    // TODO: move this logic to a service
    // @ts-ignore
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
