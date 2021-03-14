import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferApplicationSenderComponent } from './offer-application-sender.component';

describe('OfferApplicationSenderComponent', () => {
  let component: OfferApplicationSenderComponent;
  let fixture: ComponentFixture<OfferApplicationSenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferApplicationSenderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferApplicationSenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
