import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatTable, MatTableModule } from '@angular/material/table';
import { Paper, PaperGrade } from '../../services/auth.service';
import { rowAnimation } from '../../row-animations';
import { FixedPipe } from '../pipes/fixed.pipe';

@Component({
  selector: 'app-paper-grade-table',
  templateUrl: './paper-grade-table.component.html',
  styleUrls: ['./paper-grade-table.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    FixedPipe
  ],
  animations: [
    rowAnimation,
  ]
})
export class PaperGradeTableComponent implements OnChanges {

  constructor() { }

  displayedColumns = ['name', 'forPaper', 'forPresentation', 'average'];

  @Input() paper: Paper;
  @ViewChild('table') table: MatTable<PaperGrade>;

  ngOnChanges(): void {
    this.table?.renderRows();
  }

  getAverageForPaper() {
    let sum = 0;
    this.paper.grades.forEach(grade => {
      sum += grade.forPaper;
    });
    return sum / this.paper.grades.length;
  }

  getAverageForPresentation() {
    let sum = 0;
    this.paper.grades.forEach(grade => {
      sum += grade.forPresentation;
    });
    return sum / this.paper.grades.length;
  }

  getAverage() {
    this.table?.renderRows();
    return (this.getAverageForPaper() + this.getAverageForPresentation()) / 2;
  }

}
