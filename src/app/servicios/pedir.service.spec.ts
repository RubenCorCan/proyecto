import { TestBed } from '@angular/core/testing';

import { PedirService } from './pedir.service';

describe('PedirService', () => {
  let service: PedirService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedirService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
