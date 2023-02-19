import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sudo-dialog',
  templateUrl: './sudo-dialog.component.html',
  styleUrls: ['./sudo-dialog.component.scss']
})
export class SudoDialogComponent implements OnInit {

  constructor(private dialog: MatDialogRef<SudoDialogComponent>, private auth: AuthService) { }

  sudoForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  isLoading = false;

  sudo() {
    this.isLoading = true;
    const password = this.sudoForm.get('password').value;
    this.auth.checkSudoPassword(password).subscribe(result => {
      if(result) {
        this.dialog.close(password);
      } else {
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
  }

}
