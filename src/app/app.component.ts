import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer, MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { combineLatest } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators'
import { routerFadeAnimation } from './animations';
import { ProblemReportButtonComponent } from './components/problem-report/problem-report.component';
import { AuthService, SessionSettings, UserData } from './services/auth.service';
import { UserProfileEditorComponent } from './shared/components/user-profile-editor/user-profile-editor.component';
import { environment } from '../environments/environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoaderService } from './services/loader.service';
import { IdentityListItemComponent } from "./shared/components/identity-list-item/identity-list-item.component";
import { ApiUrlPipe } from './shared/pipes/api-url';
import { getUserDescription } from './lib/utils';


const SideWidth = 800;
const DEFAULT_TITLE = 'Finalizare studii';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerFadeAnimation],
  standalone: true,
  imports: [
    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDrawer,
    MatSidenavModule,
    MatProgressBarModule,
    RouterModule,
    ProblemReportButtonComponent,
    IdentityListItemComponent,
    ApiUrlPipe,
  ],
})

export class AppComponent implements OnInit {
  title: string = DEFAULT_TITLE;
  drawerMode: MatDrawerMode = "over";
  hideDrawer = false;
  hideToolbar = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private dialog: MatDialog,
    private loader: LoaderService,
  ) {}

  user: UserData | undefined = undefined;
  alternativeIdentities: UserData[] = [];
  sessionSettings: SessionSettings;
  loading = true;
  loadingRoute = false;
  backendDown = false;
  appVersion = environment.appVersion;

  @ViewChild('drawer') drawer: MatDrawer;

  ngOnInit(): void {
    this.drawerMode = window.innerWidth < SideWidth ? "over" : "side";
    this.router.events.subscribe((event) => {
      switch (true) {
        case event instanceof NavigationStart:
          this.loadingRoute = true;
          break;
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError:
          this.loadingRoute = false;
          break;
      }
    });
    this.loader.events.subscribe(event => {
      switch(event.type) {
        case 'LoadStart':
          this.loadingRoute = true;
          break;
        case 'LoadEnd':
          this.loadingRoute = false;
          break;
      }
    });
    this.router.events.pipe(  // code to check for route changes and get route data
      filter(event => event instanceof NavigationEnd),
      map(() => this.route),
      map(route => {
        while (route.firstChild) route = route.firstChild
        return route
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      if(this.drawerMode == 'over') {
        this.drawer.close();
      }
      this.hideDrawer = data['hideDrawer'] === true;
      this.hideToolbar = data['hideToolbar'] === true;
      this.title = data['title'] || DEFAULT_TITLE;
      if(this.hideDrawer) {
        this.drawer.close();
      } else if(this.drawerMode == 'side') {
        this.drawer.open();
      }
    })

    combineLatest([this.auth.userData, this.auth.alternativeIdentities, this.auth.sessionSettings]).subscribe(([user, alternativeIdentities, settings]) => {
      this.loading = false;
      this.user = user;
      this.alternativeIdentities = alternativeIdentities;
      this.sessionSettings = settings;
      if(settings == null) {
        this.backendDown = true;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.drawerMode = event.target.innerWidth < SideWidth ? "over" : "side";
    if(this.drawerMode == 'side' && !this.hideDrawer) {
      this.drawer.open();
    }
  }

  signOut() {
    this.auth.signOut().subscribe(res => {
      this.router.navigate(['login']);
    });
  }

  switchUser(user: UserData) {
    this.auth.switchUser(user.id).subscribe(res => {
      if(!res.error) {
        this.router.navigate([user.type], { onSameUrlNavigation: 'reload' });
      }
    });
  }

  release() {
    this.auth.releaseUser().subscribe(res => {
      if(!res.error) {
        this.router.navigate(['admin']);
      }
    });
  }

  editProfile() {
    this.dialog.open(UserProfileEditorComponent);
  }

  prepareRoute(outlet: RouterOutlet) {
    if(outlet && outlet.isActivated) {
      if(outlet.activatedRouteData['animate'] === false) {
        return "DoNotAnimate";
      }
      return outlet.activatedRoute;
    }
    return null;
  }

  reloadApp() {
    window.location.reload();
  }

  getUserDescription = getUserDescription;
}
