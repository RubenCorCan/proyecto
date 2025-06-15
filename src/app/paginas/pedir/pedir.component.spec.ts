import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedirComponent } from './pedir.component';

describe('PedirComponent', () => {
  let component: PedirComponent;
  let fixture: ComponentFixture<PedirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedirComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
