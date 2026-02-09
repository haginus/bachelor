import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PAPER_TYPES } from '../../../lib/constants';
import { DomainsService } from '../../../services/domains.service';
import { firstValueFrom } from 'rxjs';
import { Domain, DomainType, PaperType, Specialization, StudyForm } from '../../../lib/types';

@Component({
  selector: 'app-domain-dialog',
  templateUrl: './domain-dialog.component.html',
  styleUrls: ['./domain-dialog.component.scss'],
  standalone: false
})
export class AdminDomainDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DomainDialogData,
    private domains: DomainsService,
    private dialogRef: MatDialogRef<AdminDomainDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

  isLoading = false;

  editDomainForm = new FormGroup({
    name: new FormControl<string>(this.data.domain?.name || '', { validators: [Validators.required], nonNullable: true }),
    type: new FormControl<DomainType>(this.data.domain?.type || 'bachelor', { validators: [Validators.required], nonNullable: true }),
    paperType: new FormControl<PaperType>(this.data.domain?.paperType || 'bachelor', { validators: [Validators.required], nonNullable: true }),
    specializations: new FormArray([])
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

  addSpecialization(specialization?: Specialization) {
    let group = new FormGroup({
      id: new FormControl<number | undefined>(specialization?.id, { nonNullable: true }),
      name: new FormControl<string>(specialization?.name, { validators: [Validators.required], nonNullable: true }),
      studyYears: new FormControl(specialization?.studyYears, { validators: [Validators.required, Validators.min(1)], nonNullable: true }),
      studyForm: new FormControl<StudyForm>(specialization?.studyForm || 'if', { validators: [Validators.required], nonNullable: true }),
      studentNumber: new FormControl((specialization?.studentCount ?? 0), { nonNullable: true })
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

  async saveDomain() {
    const dto = this.editDomainForm.getRawValue();
    this.isLoading = true;
    try {
      const domain = this.data.mode === 'create'
        ? await firstValueFrom(this.domains.create(dto))
        : await firstValueFrom(this.domains.update(this.data.domain.id, dto));
      this.snackbar.open("Domeniu salvat.");
      this.dialogRef.close(domain);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteDomain() {
    this.isLoading = true;
    try {
      await firstValueFrom(this.domains.delete(this.data.domain.id));
      this.snackbar.open("Domeniu șters.");
      this.dialogRef.close(true);
    } finally {
      this.isLoading = false;
    }
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
  domain?: Domain;
}
