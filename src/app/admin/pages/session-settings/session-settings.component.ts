import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewSessionDialogComponent } from '../../dialogs/new-session-dialog/new-session-dialog.component';
import { AuthService, SessionSettings } from '../../../services/auth.service';
import { AdminService } from '../../../services/admin.service';
import { DocumentService } from '../../../services/document.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-session-settings',
  templateUrl: './session-settings.component.html',
  styleUrls: ['./session-settings.component.scss']
})
export class SessionSettingsComponent implements OnInit {

  constructor(private auth: AuthService, private admin: AdminService, private document: DocumentService,
    private snackbar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.auth.getSessionSettings().subscribe(settings => {
      this.sessionSettings = settings;
      if(settings) {
        this.setFormValue(settings);
      }
      this.isLoadingSettings = false;
    });
  }

  private setFormValue(sessionSettings: SessionSettings) {
    const _formatDate = (date: string) => formatDate(date, 'yyyy-MM-dd', 'en-US', 'Europe/Bucharest');
    const settings = {
      sessionName: sessionSettings.sessionName,
      currentPromotion: sessionSettings.currentPromotion,
      applyStartDate: _formatDate(sessionSettings.applyStartDate),
      applyEndDate: _formatDate(sessionSettings.applyEndDate),
      fileSubmissionStartDate: _formatDate(sessionSettings.fileSubmissionStartDate),
      fileSubmissionEndDate: _formatDate(sessionSettings.fileSubmissionEndDate),
      paperSubmissionEndDate: _formatDate(sessionSettings.paperSubmissionEndDate),
      allowGrading: sessionSettings.allowGrading
    };
    this.settingsForm.setValue(settings);
  }

  sessionSettings: SessionSettings = null;
  isLoadingSettings = true;

  settingsForm = new FormGroup({
    "sessionName": new FormControl(null, [Validators.required]),
    "currentPromotion": new FormControl(null, [Validators.required]),
    "applyStartDate": new FormControl(null, [Validators.required]),
    "applyEndDate": new FormControl(null, [Validators.required]),
    "fileSubmissionStartDate": new FormControl(null, [Validators.required]),
    "fileSubmissionEndDate": new FormControl(null, [Validators.required]),
    "paperSubmissionEndDate": new FormControl(null, [Validators.required]),
    "allowGrading": new FormControl(null, [Validators.required]),
  }, {
    validators: [dateValidator]
  });
  settingsFormMatcher = new SettingsFormErrorStateMatcher();

  saveSettings() {
    const settings = new SessionSettings(this.settingsForm.value as any);
    this.isLoadingSettings = true;
    this.admin.changeSessionSettings(settings).subscribe(settings => {
      // If the update was successful
      if(settings) {
        this.sessionSettings = settings;
        this.snackbar.open("Setări salvate.");
      }
      this.isLoadingSettings = false;
    })
  }

  newSession() {
    let dialogRef = this.dialog.open(NewSessionDialogComponent);
    let sub = dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.sessionSettings = result;
        this.settingsForm.setValue(this.sessionSettings);
        this.snackbar.open('S-a trecut la o nouă sesiune.');
      }
      sub.unsubscribe();
    });
  }
}

const dateValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const settings = control.value as SessionSettings;
  let errors = {}
  if(new Date(settings.applyEndDate).getTime() < new Date(settings.applyStartDate).getTime()) {
    errors['applyEndDateLowerThanApplyStartDate'] = true;
  }
  if(new Date(settings.fileSubmissionStartDate).getTime() < new Date(settings.applyStartDate).getTime()) {
    errors['fileSubmissionStartDateLowerThanApplyStartDate'] = true;
  }
  if(new Date(settings.fileSubmissionEndDate).getTime() < new Date(settings.fileSubmissionStartDate).getTime()) {
    errors['fileSubmissionEndDateLowerThanFileSubmissionStartDate'] = true;
  }
  if(new Date(settings.paperSubmissionEndDate).getTime() < new Date(settings.fileSubmissionStartDate).getTime()) {
    errors['paperSubmissionEndDateLowerThanFileSubmissionStartDate'] = true;
  }
  return Object.keys(errors).length ? errors : null;
};

function getControlName(c: FormControl, directives: Array<any>): string | null {
  return directives.find(name => c == name.control).name || null
}

// Match errors by looking for the control name in the form error
class SettingsFormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    const controlName = getControlName(control, form.directives).toLowerCase();
    let formErrors = (form.form.errors ? form.form.errors : [])
    let errors = Object.keys(formErrors).map(error => error.toLowerCase());
    const foreignInvalidity = errors.filter(errorName => errorName.includes(controlName)).length > 0;
    return (control.invalid || foreignInvalidity) && (control.dirty || control.touched);
  }
}
