import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedirSeguimientoComponent } from './pedir-seguimiento.component';

describe('PedirSeguimientoComponent', () => {
  let component: PedirSeguimientoComponent;
  let fixture: ComponentFixture<PedirSeguimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedirSeguimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedirSeguimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
