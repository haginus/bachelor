import { Component, HostListener, OnInit } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators'


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

  constructor(private router: Router, private route: ActivatedRoute) { }

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
    })

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.drawerMode = event.target.innerWidth < SideWidth ? "over" : "side";
  }

}
