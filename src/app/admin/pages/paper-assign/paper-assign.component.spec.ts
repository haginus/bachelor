import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperAssignComponent } from './paper-assign.component';

describe('PaperAssignComponent', () => {
  let component: PaperAssignComponent;
  let fixture: ComponentFixture<PaperAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaperAssignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
