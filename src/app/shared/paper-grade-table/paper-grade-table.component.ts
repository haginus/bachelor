import { Component, Input, OnInit } from '@angular/core';
import { Paper } from 'src/app/services/auth.service';

@Component({
  selector: 'app-paper-grade-table',
  templateUrl: './paper-grade-table.component.html',
  styleUrls: ['./paper-grade-table.component.scss']
})
export class PaperGradeTableComponent implements OnInit {

  constructor() { }

  displayedColumns = ['name', 'forPaper', 'forPresentation', 'average'];

  @Input() paper: Paper;

  ngOnInit(): void {
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
    return (this.getAverageForPaper() + this.getAverageForPresentation()) / 2;
  }

}
