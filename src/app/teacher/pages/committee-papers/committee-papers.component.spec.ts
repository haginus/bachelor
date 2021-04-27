import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherCommitteePapersComponent } from './committee-papers.component';

describe('CommitteePapersComponent', () => {
  let component: TeacherCommitteePapersComponent;
  let fixture: ComponentFixture<TeacherCommitteePapersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherCommitteePapersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherCommitteePapersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
