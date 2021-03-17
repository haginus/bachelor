import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { OfferApplication } from 'src/app/services/student.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { ApplicationListActions } from 'src/app/shared/application-list/application-list.component';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class TeacherApplicationsComponent implements OnInit {

  constructor(private teacher: TeacherService, private snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.getApplications();
  }

  getApplications() {
    if(this.applicationSubscription) {
      this.applicationSubscription.unsubscribe();
    }
    this.isLoadingApplications = true;
    this.applicationSubscription = this.teacher.getApplications().subscribe(applications => {
      this.applications = applications;
      this.isLoadingApplications = false;
    });
  }

  applications: OfferApplication[] = []
  applicationSubscription: Subscription;
  isLoadingApplications: boolean = true;

  declineApplication(id: number) {
    let application = this._getApplication(id);
    application.accepted = false;
    this.teacher.declineApplication(id).subscribe(res => {
      if(res) {
        this.snackbar.open("Cerere respinsă.");
      } else {
        this.snackbar.open("A apărut o eroare.");
        application.accepted = null;
      }
    })
  }

  acceptApplication(id: number) {
    let application = this._getApplication(id);
    application.accepted = true;
    this.teacher.acceptApplication(id).subscribe(res => {
      if(res) {
        this.snackbar.open("Cerere acceptată.");
      } else {
        this.snackbar.open("A apărut o eroare.");
        application.accepted = null;
      }
    })
  }

  private _getApplication(id: number) {
    let idx = this.applications.findIndex(application => application.id == id);
    return idx >= 0 ? this.applications[idx] : null;

  }


  handleActions(event: ApplicationListActions) {
    if(event.action == 'accept') {
      this.acceptApplication(event.applicationId);
    }
    if(event.action == 'decline') {
      this.declineApplication(event.applicationId);
    }
  }

}
