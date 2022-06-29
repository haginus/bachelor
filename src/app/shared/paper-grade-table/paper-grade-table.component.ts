import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { toFixedTruncate } from 'src/app/lib/utils';
import { Paper, PaperGrade } from 'src/app/services/auth.service';

@Component({
  selector: 'app-paper-grade-table',
  templateUrl: './paper-grade-table.component.html',
  styleUrls: ['./paper-grade-table.component.scss']
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
    return toFixedTruncate(sum / this.paper.grades.length, 2);
  }

  getAverageForPresentation() {
    let sum = 0;
    this.paper.grades.forEach(grade => {
      sum += grade.forPresentation;
    });
    return toFixedTruncate(sum / this.paper.grades.length, 2);
  }

  getAverage() {
    this.table?.renderRows();
    return toFixedTruncate((this.getAverageForPaper() + this.getAverageForPresentation()) / 2, 2);
  }

}
