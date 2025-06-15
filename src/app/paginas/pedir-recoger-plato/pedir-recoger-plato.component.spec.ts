import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedirRecogerPlatoComponent } from './pedir-recoger-plato.component';

describe('PedirRecogerPlatoComponent', () => {
  let component: PedirRecogerPlatoComponent;
  let fixture: ComponentFixture<PedirRecogerPlatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedirRecogerPlatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedirRecogerPlatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
