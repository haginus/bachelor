import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemReportComponent } from './problem-report.component';

describe('ProblemReportComponent', () => {
  let component: ProblemReportComponent;
  let fixture: ComponentFixture<ProblemReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProblemReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
