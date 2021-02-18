import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators'
import { AuthService, UserData } from './services/auth.service';


const SideWidth = 800;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'Platformă de asociere';
  drawerMode: MatDrawerMode = "over";
  hideDrawer = false;
  hideToolbar = false;

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) { }

  user : UserData | undefined = undefined;
  loading = true;

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
      this.hideDrawer = data.hideDrawer === true;
      this.hideToolbar = data.hideToolbar === true;
      this.title = data.title != undefined ? data.title : 'Platformă de asociere';
      if(this.hideDrawer) {
        this.drawer.close();
      } else if(this.drawerMode == 'side') {
        this.drawer.open();
      }
    })

    this.auth.userData.subscribe(user => {
      this.loading = false;
      this.user = user
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

}
