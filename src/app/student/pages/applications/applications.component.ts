import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OfferApplication, StudentService } from '../../../services/student.service';
import { ApplicationListActions } from '../../../shared/components/application-list/application-list.component';

@Component({
  selector: 'app-student-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class StudentApplicationsComponent implements OnInit {

  constructor(private student: StudentService, private snackbar: MatSnackBar,
    private route: ActivatedRoute, private router: Router) { }

  applications: OfferApplication[] = []
  isLoadingApplications: boolean = true;

  applicationSubscription: Subscription;
  routeSubscription: Subscription;

  state: 'accepted' | 'declined' | 'pending' = null;

  ngOnInit(): void {
    this.routeSubscription =  this.route.params.subscribe(res => {
      if(res['state'] !== undefined) {
        if(!['accepted', 'declined', 'pending'].includes(res['state'])) { // check state
          this.router.navigate(['student', 'applications']);
        } else {
          this.state = res['state'];
        }
      }
      this.getApplications();
    });
  }

  ngOnDestroy() {
    this.applicationSubscription.unsubscribe();
  }

  getApplications() {
    if(this.applicationSubscription) {
      this.applicationSubscription.unsubscribe();
    }
    this.isLoadingApplications = true;
    this.applicationSubscription = this.student.getApplications(this.state).subscribe(applications => {
      this.applications = applications;
      this.isLoadingApplications = false;
    });
  }

  cancelApplication(id: number) {
    let idx = this.applications.findIndex(application => application.id == id);
    let application = null;
    if(idx >= 0) {
      [application] = this.applications.splice(idx, 1);
    }
    this.student.cancelApplication(id).subscribe(res => {
      if(res) {
        this.snackbar.open("Cerere retrasă.");
      } else {
        if(application) {
          this.applications.splice(idx, 0, application);
        }
      }
    })
  }

  handleActions(event: ApplicationListActions) {
    if(event.action == 'cancel') {
      this.cancelApplication(event.applicationId);
    }
  }

}
