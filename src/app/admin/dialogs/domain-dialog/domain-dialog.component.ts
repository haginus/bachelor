import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { Domain, DomainSpecialization } from '../../../services/auth.service';

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
    "paperType": new FormControl(this.data.domain?.paperType, [Validators.required]),
    "specializations": new FormArray([])
  });

  PAPER_TYPES = PAPER_TYPES;

  get formSpecializations() { return this.editDomainForm.get("specializations") as FormArray }

  ngOnInit(): void {
    if(this.data.mode == 'edit') {
      let specializations = this.data.domain.specializations;

      specializations.forEach(specialization => {
        this.addSpecialization(specialization);
      });
    }
  }

  addSpecialization(specialization?: DomainSpecialization) {
    let group = new FormGroup({
      "id": new FormControl(specialization?.id),
      "name": new FormControl(specialization?.name, [Validators.required]),
      "studyYears": new FormControl(specialization?.studyYears, [Validators.required, Validators.min(1)]),
      "studentNumber": new FormControl((specialization ? specialization.studentNumber : 0))
    });
    this.formSpecializations.push(group);
  }

  removeSpecialization(index: number) {
    this.formSpecializations.removeAt(index);
  }

  private getDomainFormValue(): Domain {
    let domain = this.editDomainForm.value as Domain;
    domain.specializations = domain.specializations.map(spec => { // remove id attribute
      let newSpec: any = { name: spec.name, studyYears: spec.studyYears };
      if(spec.id != null) {
        newSpec.id = spec.id;
      }
      return newSpec;
    });
    return domain;
  }

  addDomain() {
    let domain = this.getDomainFormValue();
    this.isLoading = true;
    this.admin.addDomain(domain).subscribe(res => {
      if(res) {
        this.snackbar.open("Domeniu salvat.");
        this.dialogRef.close(res);
      } else {
        this.isLoading = false;
      }
    });
  }

  editDomain() {
    let domain = this.getDomainFormValue();
    domain.id = this.data.domain.id;

    this.isLoading = true;
    this.admin.editDomain(domain).subscribe(res => {
      if(res) {
        this.snackbar.open("Domeniu salvat.");
        this.dialogRef.close(res);
      } else {
        this.isLoading = false;
      }
    });
  }

  deleteDomain() {
    const id = this.data.domain.id;

    this.isLoading = true;
    this.admin.deleteDomain(id).subscribe(res => {
      if(res) {
        this.snackbar.open("Domeniu șters.");
        this.dialogRef.close(res);
      } else {
        this.isLoading = false;
      }
    })
  }

  get domainType() {
    return this.editDomainForm.get("type");
  }

  get paperType() {
    return this.editDomainForm.get("paperType");
  }

}

export interface DomainDialogData {
  mode: 'create' | 'edit' | 'delete';
  domain?: Domain
}
