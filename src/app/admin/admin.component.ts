import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../services/statistics.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
  }

  statistics$ = this.statisticsService.findAll();
}
