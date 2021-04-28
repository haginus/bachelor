import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-grade-paper',
  templateUrl: './grade-paper.component.html',
  styleUrls: ['./grade-paper.component.scss']
})
export class GradePaperComponent implements OnInit {

  constructor() { }

  gradeForm = new FormGroup({
    // only integer numbers ranged from 1 to 10
    "forPaper": new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern("^[0-9]*$")]),
    "forPresentation": new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern("^[0-9]*$")])
  });

  get forPaper() { return this.gradeForm.get('forPaper'); }
  get forPresentation() { return this.gradeForm.get('forPresentation'); }

  ngOnInit(): void {
  }

}
