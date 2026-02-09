import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationListActions, ApplicationListComponent } from '../../../shared/components/application-list/application-list.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Application } from '../../../lib/types';
import { ApplicationsService } from '../../../services/applications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  imports: [
    LoadingComponent,
    ApplicationListComponent,
  ]
})
export class TeacherApplicationsComponent {

  constructor(
    private applicationsService: ApplicationsService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.pipe(takeUntilDestroyed()).subscribe(res => {
      try {
        if(res['state'] !== undefined) {
          if(['accepted', 'declined', 'pending'].includes(res['state'])) {
            this.state = res['state'];
          } else {
            throw '';
          }
        }
        if(res['offerId'] !== undefined) {
          let number = parseInt(res['offerId']);
          if(isFinite(number)) {
            this.offerId = number;
          } else {
            throw '';
          }
        }
        this.getApplications();
      } catch {
        this.router.navigate(['teacher', 'applications']);
      }
    });
  }

  offerId?: number;
  state?: 'accepted' | 'declined' | 'pending';

  applications: Application[] = [];
  isLoadingApplications: boolean = true;

  async getApplications() {
    this.isLoadingApplications = true;
    try {
      this.applications = await firstValueFrom(this.applicationsService.findMine({ offerId: this.offerId, state: this.state }));
      this.isLoadingApplications = false;
    } catch {
      this.applications = [];
    } finally {
      this.isLoadingApplications = false;
    }
  }

  async declineApplication(application: Application) {
    application.accepted = false;
    try {
      await firstValueFrom(this.applicationsService.decline(application.id));
      this.snackbar.open("Cerere respinsă.");
    } catch {
      application.accepted = null;
    }
  }

  async acceptApplication(application: Application) {
    application.accepted = true;
    try {
      await firstValueFrom(this.applicationsService.accept(application.id));
      const offerId = application.offer.id;
      this.applications.forEach((application) => {
        const offer = application.offer;
        if(offer.id === offerId) {
          offer.takenSeats += 1;
        }
      });
      this.snackbar.open("Cerere acceptată.");
    } catch {
      application.accepted = null;
    }
  }

  handleActions(event: ApplicationListActions) {
    if(event.action == 'accept') {
      this.acceptApplication(event.application);
    }
    if(event.action == 'decline') {
      this.declineApplication(event.application);
    }
  }

}
