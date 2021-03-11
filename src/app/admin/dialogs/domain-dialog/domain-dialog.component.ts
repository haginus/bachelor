import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from 'src/app/services/admin.service';
import { Domain } from 'src/app/services/auth.service';

@Component({
  selector: 'app-domain-dialog',
  templateUrl: './domain-dialog.component.html',
  styleUrls: ['./domain-dialog.component.scss']
})
export class AdminDomainDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DomainDialogData, private admin: AdminService,
    private dialogRef: MatDialogRef<AdminDomainDialogComponent>, private snackbar: MatSnackBar) { }

  isLoading = false;

  editDomainForm = new FormGroup({
    "name": new FormControl(this.data.domain?.name, [Validators.required]),
    "type": new FormControl(this.data.domain?.type, [Validators.required]),
  });

  deleteDomainForm = new FormGroup({
    "moveStudentsTo": new FormControl(null, [Validators.required])
  })

  remainingDomains: Domain[];

  ngOnInit(): void {
    if(this.data.mode == 'delete') { // exclude the deleted in the future domain from the list to transfer students
      this.remainingDomains = this.data.domains.filter(domain => domain.id != this.data.domain.id)
    }
  }

  private getDomainFormValue() {
    const name = this.editDomainForm.get("name").value;
    const type = this.editDomainForm.get("type").value;
    return { name, type }
  }

  addDomain() {
    const { name, type } = this.getDomainFormValue();
    
    this.isLoading = true;
    this.admin.addDomain(name, type).subscribe(res => {
      if(res) {
        this.snackbar.open("Domeniu salvat.");
        this.dialogRef.close(res);
      } else {
        this.snackbar.open("A apărut o eroare.");
        this.isLoading = false;
      }
    });
  }

  editDomain() {
    const { name, type } = this.getDomainFormValue();
    const id = this.data.domain.id;

    this.isLoading = true;
    this.admin.editDomain(id, name, type).subscribe(res => {
      if(res) {
        this.snackbar.open("Domeniu salvat.");
        this.dialogRef.close(res);
      } else {
        this.snackbar.open("A apărut o eroare.");
        this.isLoading = false;
      }
    });
  }

  deleteDomain() {
    const id = this.data.domain.id;
    const moveStudentsTo = this.deleteDomainForm.get("moveStudentsTo").value;
    
    this.isLoading = true;
    this.admin.deleteDomain(id, moveStudentsTo).subscribe(res => {
      if(res) {
        this.snackbar.open("Domeniu șters.");
        this.dialogRef.close(res);
      } else {
        this.snackbar.open("A apărut o eroare.");
        this.isLoading = false;
      }
    })
  }

}

export interface DomainDialogData {
  mode: 'create' | 'edit' | 'delete';
  domains?: Domain[]
  domain?: Domain
}
