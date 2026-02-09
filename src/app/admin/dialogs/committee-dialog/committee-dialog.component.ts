import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { dateToDatetimeLocal } from '../../../lib/utils';
import { CommitteesService } from '../../../services/committees.service';
import { DomainsService } from '../../../services/domains.service';
import { TeachersService } from '../../../services/teachers.service';
import { Committee, CommitteeMember, CommitteeMemberRole, Domain, Teacher } from '../../../lib/types';

@Component({
  selector: 'app-committee-dialog',
  templateUrl: './committee-dialog.component.html',
  styleUrls: ['./committee-dialog.component.scss'],
  standalone: false
})
export class CommitteeDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CommitteeDialogData,
    private readonly committeesService: CommitteesService,
    private readonly domainsService: DomainsService,
    private readonly teachersService: TeachersService,
    private dialog: MatDialogRef<CommitteeDialogComponent>,
    private readonly snackBar: MatSnackBar,
  ) { }

  isLoading: boolean = false;
  domains: Domain[];
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  selectedDomainType: string = null;

  teacherNameMatcher = new TeacherNameMatcher();

  editCommitteeForm = new FormGroup({
    "id": new FormControl(this.data.data?.id),
    "name": new FormControl(this.data.data?.name, [Validators.required]),
    "activityDays": new FormArray([]),
    "members": new FormArray([], [CommitteeMembersValidator]), // Validate that the committee componence is OK
    "domains": new FormControl([], [Validators.required])
  })

  get formMembers() { return this.editCommitteeForm.get("members") as FormArray };

  get activityDays() {
    return this.editCommitteeForm.get('activityDays') as FormArray;
  }

  ngOnInit(): void {
    this.domainsService.findAll().subscribe(domains => {
      this.domains = domains;
    });
    // Add some empty fields at creation
    if (this.data.mode == 'create') {
      this.addMember({ role: 'president' }, true);
      this.addMember({ role: 'secretary' }, true);
      this.addMember({ role: 'member' }, true);
      this.addMember({ role: 'member' }, true);
    }
    // Edit mode
    if(this.data.mode == 'edit') {
      // Add members to form
      this.data.data.members.forEach(member => this.addMember(member));
      // Add domains to form - map domain to object to just id and set control value to the array
      let domainIds = this.data.data.domains.map(domain => domain.id);
      this.selectedDomainType = this.data.data.domains[0]?.type;
      this.editCommitteeForm.get("domains").setValue(domainIds);
      this.editCommitteeForm.setControl('activityDays', new FormArray(
        this.data.data.activityDays.map(day => new FormGroup({
          'location': new FormControl<string>(day.location, [Validators.required]),
          'startTime': new FormControl<string>(dateToDatetimeLocal(day.startTime), [Validators.required]),
        }))
      ));
    }

    // Get teachers for filtering
    this.teachersService.findAll({ limit: 1000 }).subscribe(result => {
      this.teachers = result.rows;
      this.filteredTeachers = this._filterTeachers(null);
    });
  }

  handleDomainChange(event: MatSelectChange) {
    const domainIds: number[] = event.value;
    if(domainIds.length > 0) {
      this.selectedDomainType = this.domains.find(domain => domain.id == domainIds[0]).type;
    } else {
      this.selectedDomainType = null;
    }
  }

  addActivityDay() {
    this.activityDays.push(new FormGroup({
      'location': new FormControl<string>('', [Validators.required]),
      'startTime': new FormControl<string>('', [Validators.required]),
    }));
  }

  removeActivityDay(index: number) {
    this.activityDays.removeAt(index);
  }

  // If committeeCreation is true, the function will init empty fields
  addMember(member?: { role: CommitteeMemberRole; teacherId?: number; teacher?: Teacher }, committeeCreation: boolean = false) {
    let name: string;
    if (committeeCreation) {
      name = null;
    } else {
      name = member ? member.teacher.lastName + ' ' + member.teacher.firstName : null;
    }
    let formGroup = new FormGroup({
      "teacherId": new FormControl(member?.teacherId, [Validators.required]),
      "name": new FormControl(name, [Validators.required]),
      "role": new FormControl(member?.role, [Validators.required])
    });
    formGroup.get("name").valueChanges.subscribe(res => this.handleValueChange(res, formGroup));
    this.formMembers.push(formGroup);
  }

  removeMember(index: number) {
    this.formMembers.removeAt(index);
  }

  async saveCommittee() {
    const dto = {
      name: this.editCommitteeForm.value.name,
      domainIds: this.editCommitteeForm.value.domains,
      activityDays: this.editCommitteeForm.value.activityDays.map((day => ({ ...day, startTime: new Date(day.startTime).toISOString() }))),
      members: this.editCommitteeForm.value.members.map(member => ({
        teacherId: member.teacherId,
        role: member.role
      }))
    };
    try {
      this.isLoading = true;
      const result = this.data.mode == 'create'
        ? await firstValueFrom(this.committeesService.create(dto))
        : await firstValueFrom(this.committeesService.update(this.data.data.id, dto));
      this.dialog.close(result);
      this.snackBar.open(`Comisie ${this.data.mode == 'create' ? 'adăugată' : 'salvată'}.`);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCommittee() {
    const id = this.data.data.id;
    this.isLoading = true;
    try {
      await firstValueFrom(this.committeesService.delete(id));
      this.dialog.close(true);
      this.snackBar.open("Comisie ștearsă.");
    } finally {
      this.isLoading = false;
    }
  }

  // Handle value change event of teacher name control
  handleValueChange(value: string | Teacher, formGroup: FormGroup) {
    if (typeof value == "string") { // if the value is string
      formGroup.get('teacherId').setValue(null); // set the id to null so `name` will be matched with error by the matcher
      formGroup.get('name').markAsUntouched(); // mark as untouched so the error doen't show until user leaves focus of control
      this.filteredTeachers = this._filterTeachers(value); // filter teachers for autofill
    } else { // if it is object, it means that the user has selected an option in autofill
      formGroup.get('teacherId').setValue(value.id); // set the id so the control leaves error state
      const fullName = value.lastName + ' ' + value.firstName;
      formGroup.get('name').setValue(fullName, { emitEvent: false }); // autocomplete with the full name
      this.filteredTeachers = this._filterTeachers(null); // filter again so the selected teacher won't appear as option in the future
    }
  }

  private _filterTeachers(value: string): Teacher[] {
    const filterValue = value ? value.toLowerCase() : '';
    const takenIds = new Set(this.formMembers.value.map(member => member.teacherId));

    return this.teachers.filter(user => {
      // Don't show already picked teachers
      if (takenIds.has(user.id)) {
        return false;
      }
      // filter by name
      const lastName = user.lastName.toLowerCase();
      const firstName = user.firstName.toLowerCase();
      const fullName = lastName + ' ' + firstName;
      return lastName.includes(filterValue) || firstName.includes(filterValue) || fullName.includes(filterValue);
    });
  }

}

export interface CommitteeDialogData {
  mode: 'create' | 'edit' | 'delete';
  data?: Committee;
}


const CommitteeMembersValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const memberArray = control.value as CommitteeMember[];
  let errors = {}
  const presidentNumber = memberArray.filter(member => member.role == 'president').length;
  const secretaryNumber = memberArray.filter(member => member.role == 'secretary').length;
  const memberNumber = memberArray.filter(member => member.role == 'member').length;

  // there must be exactly one president
  if (presidentNumber < 1) {
    errors["atLeastOnePresident"] = true;
  }
  if (presidentNumber > 1) {
    errors["atMostOnePresident"] = true;
  }
  // there must be exactly one secretary
  if (secretaryNumber < 1) {
    errors["atLeastOneSecretary"] = true;
  }
  if (secretaryNumber > 1) {
    errors["atMostOneSecretary"] = true;
  }
  // there must be at least two members
  if (memberNumber < 2) {
    errors["atLeastTwoMembers"] = true;
  }

  return Object.keys(errors).length ? errors : null;
};

// Match errors by looking for the control name in the form error
class TeacherNameMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    let foreignInvalidity = control.parent.get("teacherId").value == null;
    return (control.invalid || foreignInvalidity) && control.touched;
  }
}
