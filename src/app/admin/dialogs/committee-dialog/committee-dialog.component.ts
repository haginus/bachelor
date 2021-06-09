import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormGroupDirective, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Observable } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { Domain, UserData, Committee, CommitteeMember  } from 'src/app/services/auth.service';

@Component({
  selector: 'app-committee-dialog',
  templateUrl: './committee-dialog.component.html',
  styleUrls: ['./committee-dialog.component.scss']
})
export class CommitteeDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: CommitteeDialogData, private admin: AdminService,
    private dialog: MatDialogRef<CommitteeDialogComponent>) { }

  isLoading: boolean = false;
  domains: Domain[];
  teachers: UserData[];
  filteredTeachers: UserData[];
  selectedDomainType: string = null;

  teacherNameMatcher = new TeacherNameMatcher();

  editCommitteeForm = new FormGroup({
    "id": new FormControl(this.data.data?.id),
    "name": new FormControl(this.data.data?.name, [Validators.required]),
    "members": new FormArray([], [CommitteeMembersValidator]), // Validate that the committee componence is OK
    "domains": new FormControl([], [Validators.required])
  })

  get formMembers() { return this.editCommitteeForm.get("members") as FormArray }

  ngOnInit(): void {
    this.admin.getDomains().subscribe(domains => {
      this.domains = domains;
    })
    // Add some empty fields at creation
    if (this.data.mode == 'create') {
      this.addMember({ role: 'president', teacherId: null, user: { firstName: null, lastName: null, id: null } }, true);
      this.addMember({ role: 'secretary', teacherId: null, user: { firstName: null, lastName: null, id: null } }, true);
      this.addMember({ role: 'member', teacherId: null, user: { firstName: null, lastName: null, id: null } }, true);
      this.addMember({ role: 'member', teacherId: null, user: { firstName: null, lastName: null, id: null } }, true);
    }
    // Edit mode
    if(this.data.mode == 'edit') {
      // Add members to form
      this.data.data.members.forEach(member => this.addMember(member));
      // Add domains to form - map domain to object to just id and set control value to the array
      let domainIds = this.data.data.domains.map(domain => domain.id);
      this.selectedDomainType = this.data.data.domains[0]?.type;
      this.editCommitteeForm.get("domains").setValue(domainIds);
    }

    // Get teachers for filtering
    this.admin.getTeacherUsers('id', 'asc', 0, 1000).subscribe(result => {
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

  // If committeeCreation is true, the function will init empty fields
  addMember(member?: CommitteeMember, committeeCreation: boolean = false) {
    let name: string;
    if (committeeCreation) {
      name = null;
    } else {
      name = member ? member.user.lastName + ' ' + member.user.firstName : null;
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

  private _getFormData() {
    let committee: any = { ... this.editCommitteeForm.value };
    const { id, name, domains } = committee;
    const members: CommitteeMember[] = committee.members.map(member => {
      return { teacherId: member.teacherId, role: member.role }
    });
    return { id, name, domains, members }
  }

  addCommittee() {
    const { name, domains, members } = this._getFormData();
    this.isLoading = true;
    this.admin.addCommittee(name, domains, members).subscribe(result => {
      this.isLoading = false;
      if(result) {
        this.dialog.close(result);
      }
    })
  }

  editCommittee() {
    const { id, name, domains, members } = this._getFormData();
    this.isLoading = true;
    this.admin.editCommittee(id, name, domains, members).subscribe(result => {
      this.isLoading = false;
      if(result) {
        this.dialog.close(result);
      }
    })
  }

  deleteCommittee() {
    const { id } = this._getFormData();
    this.isLoading = true;
    this.admin.deleteCommittee(id).subscribe(result => {
      this.isLoading = false;
      if(result) {
        this.dialog.close(result);
      }
    })
  }

  // Handle value change event of teacher name control
  handleValueChange(value: string | UserData, formGroup: FormGroup) {
    if (typeof value == "string") { // if the value is string
      formGroup.get('teacherId').setValue(null); // set the id to null so `name` will be matched with error by the matcher
      formGroup.get('name').markAsUntouched(); // mark as untouched so the error doen't show until user leaves focus of control
      this.filteredTeachers = this._filterTeachers(value); // filter teachers for autofill
    } else { // if it is object, it means that the user has selected an option in autofill
      formGroup.get('teacherId').setValue(value.teacher.id); // set the id so the control leaves error state
      const fullName = value.lastName + ' ' + value.firstName;
      formGroup.get('name').setValue(fullName, { emitEvent: false }); // autocomplete with the full name
      this.filteredTeachers = this._filterTeachers(null); // filter again so the selected teacher won't appear as option in the future
    }
  }

  private _filterTeachers(value: string): UserData[] {
    const filterValue = value ? value.toLowerCase() : '';
    const takenIds = (this.formMembers.value as CommitteeMember[])
      .map(member => member.teacherId); // get the teachers that are already picked

    return this.teachers.filter(user => {
      // Don't show already picked teachers
      if (takenIds.includes(user.teacher.id)) {
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
  mode: 'create' | 'edit' | 'delete',
  data?: Committee
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
