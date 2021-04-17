import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCommitteesComponent } from './committees.component';

describe('CommitteesComponent', () => {
  let component: TeacherCommitteesComponent;
  let fixture: ComponentFixture<TeacherCommitteesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherCommitteesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherCommitteesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
