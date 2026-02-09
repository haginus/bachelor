import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { AdminDomainDialogComponent } from '../../dialogs/domain-dialog/domain-dialog.component';
import { rowAnimation } from '../../../row-animations';
import { DomainsService } from '../../../services/domains.service';
import { Domain } from '../../../lib/types';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss'],
  animations: [
    rowAnimation,
  ],
  standalone: false
})
export class AdminDomainsComponent implements OnInit, OnDestroy {

  constructor(private domains: DomainsService, private dialog: MatDialog) { }

  @ViewChild('table') table: MatTable<Domain>;
  data: Domain[]
  isLoadingResults: boolean = true;
  displayedColumns: string[] = ['id', 'name', 'type', 'studentCount', 'offerCount', 'actions'];

  private domainSub: Subscription;

  private getDomains(): void {
    if(this.domainSub) {
      this.domainSub.unsubscribe();
    }
    this.isLoadingResults = true;
    this.domainSub = this.domains.findAll({ detailed: true }).subscribe(domains => {
      this.data = domains;
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.getDomains();
  }

  ngOnDestroy() {
    this.domainSub.unsubscribe();
  }

  addDomain() {
    const dialogRef = this.dialog.open(AdminDomainDialogComponent, {
      data: {
        mode: 'create',
        domains: this.data
      }
    });

    dialogRef.afterClosed().subscribe(domain => {
      if(domain) {
        this.data.push(domain);
        this.table.renderRows();
      }
    })
  }

  editDomain(id: number) {
    const dialogRef = this.dialog.open(AdminDomainDialogComponent, {
      data: {
        mode: 'edit',
        domain: this.data.find(domain => domain.id == id)
      }
    });

    dialogRef.afterClosed().subscribe(domain => {
      if(domain) {
        const idx = this.data.findIndex(oldDomain => oldDomain.id == domain.id);
        if(idx >= 0) {
          this.data[idx] = domain;
          this.table.renderRows();
        }
      }
    })
  }

  deleteDomain(id: number) {
    const dialogRef = this.dialog.open(AdminDomainDialogComponent, {
      data: {
        mode: 'delete',
        domain: this.data.find(domain => domain.id == id)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        const idx = this.data.findIndex(oldDomain => oldDomain.id == id);
        if(idx >= 0) {
          this.data.splice(idx, 1);
          this.table.renderRows();
        }
      }
    })
  }

  refreshResults() {
    this.getDomains();
  }




}
