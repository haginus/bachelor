import { TestBed } from '@angular/core/testing';

import { NotValidatedGuard } from './not-validated.guard';

describe('NotValidatedGuard', () => {
  let guard: NotValidatedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NotValidatedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
