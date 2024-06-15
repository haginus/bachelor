import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TeacherService } from '../../../services/teacher.service';
import { OfferApplication } from '../../../services/student.service';
import { ApplicationListActions, ApplicationListComponent } from '../../../shared/components/application-list/application-list.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  standalone: true,
  imports: [
    LoadingComponent,
    ApplicationListComponent,
  ],
})
export class TeacherApplicationsComponent implements OnInit, OnDestroy {

  constructor(
    private teacher: TeacherService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  offerId: number = null;
  state: 'accepted' | 'declined' | 'pending' = null;

  applications: OfferApplication[] = []
  isLoadingApplications: boolean = true;

  applicationSubscription: Subscription;
  routeSubscription: Subscription;

  ngOnInit(): void {
    this.routeSubscription =  this.route.params.subscribe(res => {
      if(res['state'] !== undefined) {
        if(!['accepted', 'declined', 'pending'].includes(res['state'])) { // check state
          this.router.navigate(['teacher', 'applications']);
        } else {
          this.state = res['state'];
        }
      }
      if(res['offerId'] !== undefined) {
        let number = parseInt(res['offerId']);
        if(isFinite(number)) {
          this.offerId = number;
        }
      }
    this.getApplications();
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.applicationSubscription.unsubscribe();
  }

  getApplications() {
    if(this.applicationSubscription) {
      this.applicationSubscription.unsubscribe();
    }
    this.isLoadingApplications = true;
    this.applicationSubscription = this.teacher.getApplications(this.offerId, this.state).subscribe(applications => {
      this.applications = applications;
      this.isLoadingApplications = false;
    });
  }

  declineApplication(id: number) {
    let application = this._getApplication(id);
    application.accepted = false;
    this.teacher.declineApplication(id).subscribe(res => {
      if(res) {
        this.snackbar.open("Cerere respinsă.");
      } else {
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
