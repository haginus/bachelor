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
  selector: 'app-student-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  standalone: true,
  imports: [
    LoadingComponent,
    ApplicationListComponent,
  ]
})
export class StudentApplicationsComponent {

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
        this.getApplications();
      } catch {
        this.router.navigate(['teacher', 'applications']);
      }
    });
  }

  applications: Application[] = []
  isLoadingApplications: boolean = true;

  state?: 'accepted' | 'declined' | 'pending';

  async getApplications() {
    this.isLoadingApplications = true;
    try {
      this.applications = await firstValueFrom(this.applicationsService.findMine({ state: this.state }));
      this.isLoadingApplications = false;
    } catch {
      this.applications = [];
    } finally {
      this.isLoadingApplications = false;
    }
  }

  async cancelApplication(application: Application) {
    let idx = this.applications.findIndex(a => a.id == application.id);
    if(idx >= 0) {
      this.applications.splice(idx, 1);
    }
    try {
      await firstValueFrom(this.applicationsService.withdraw(application.id));
      this.snackbar.open("Cerere retrasă.");
    } catch {
      idx >= 0 && this.applications.splice(idx, 0, application);
    }
  }

  handleActions(event: ApplicationListActions) {
    if(event.action == 'cancel') {
      this.cancelApplication(event.application);
    }
  }

}
