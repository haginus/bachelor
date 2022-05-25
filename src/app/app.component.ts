import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { combineLatest } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators'
import { environment } from 'src/environments/environment';
import { routerFadeAnimation } from './animations';
import { ProblemReportComponent } from './components/problem-report/problem-report.component';
import { AuthService, SessionSettings, UserData } from './services/auth.service';
import { UserProfileEditorComponent } from './shared/user-profile-editor/user-profile-editor.component';


const SideWidth = 800;
const DEFAULT_TITLE = 'Platformă de asociere';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerFadeAnimation]
})

export class AppComponent implements OnInit {
  title: string = DEFAULT_TITLE;
  drawerMode: MatDrawerMode = "over";
  hideDrawer = false;
  hideToolbar = false;

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService,
    private dialog: MatDialog) { }

  user: UserData | undefined = undefined;
  sessionSettings: SessionSettings;
  loading = true;
  backendDown = false;
  appVersion = environment.appVersion;

  @ViewChild('drawer') drawer: MatDrawer;

  ngOnInit(): void {
    this.drawerMode = window.innerWidth < SideWidth ? "over" : "side";
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
      this.hideDrawer = data.hideDrawer === true;
      this.hideToolbar = data.hideToolbar === true;
      this.title = data.title != undefined ? data.title : DEFAULT_TITLE;
      if(this.hideDrawer) {
        this.drawer.close();
      } else if(this.drawerMode == 'side') {
        this.drawer.open();
      }
    })

    combineLatest([this.auth.userData, this.auth.sessionSettings]).subscribe(([user, settings]) => {
      this.loading = false;
      this.user = user;
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

  sendFeedback() {
    this.dialog.open(ProblemReportComponent);
  }

  prepareRoute(outlet: RouterOutlet) {
    if(outlet && outlet.isActivated) {
      if(outlet.activatedRouteData.animate === false) {
        return "DoNotAnimate";
      }
      return outlet.activatedRoute;
    }
    return null;
  }

  reloadApp() {
    window.location.reload();
  }
}