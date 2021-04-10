import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperDocumentListComponent } from './paper-document-list.component';

describe('PaperDocumentListComponent', () => {
  let component: PaperDocumentListComponent;
  let fixture: ComponentFixture<PaperDocumentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaperDocumentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperDocumentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
