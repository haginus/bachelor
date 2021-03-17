import { Component, OnInit } from '@angular/core';
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

  constructor(private teacher: TeacherService) { }

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


  handleActions(event: ApplicationListActions) {
    if(event.action == 'accept') {
      let idx = this.applications.findIndex(application => application.id == event.applicationId);
      this.applications[idx].accepted = true;
    }
    if(event.action == 'decline') {
      let idx = this.applications.findIndex(application => application.id == event.applicationId);
      this.applications[idx].accepted = false;
    }
  }

}
