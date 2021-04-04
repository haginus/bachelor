import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeDialogComponent } from './committee-dialog.component';

describe('CommitteeDialogComponent', () => {
  let component: CommitteeDialogComponent;
  let fixture: ComponentFixture<CommitteeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommitteeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
