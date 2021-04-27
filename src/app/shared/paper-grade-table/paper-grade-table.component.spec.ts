import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperGradeTableComponent } from './paper-grade-table.component';

describe('PaperGradeTableComponent', () => {
  let component: PaperGradeTableComponent;
  let fixture: ComponentFixture<PaperGradeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaperGradeTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperGradeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
