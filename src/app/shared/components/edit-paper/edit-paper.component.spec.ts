import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPaperComponent } from './edit-paper.component';

describe('EditPaperComponent', () => {
  let component: EditPaperComponent;
  let fixture: ComponentFixture<EditPaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPaperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
