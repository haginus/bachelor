import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSetupComponent } from './student-setup.component';

describe('StudentSetupComponent', () => {
  let component: StudentSetupComponent;
  let fixture: ComponentFixture<StudentSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
