import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradePaperComponent } from './grade-paper.component';

describe('GradePaperComponent', () => {
  let component: GradePaperComponent;
  let fixture: ComponentFixture<GradePaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GradePaperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GradePaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
