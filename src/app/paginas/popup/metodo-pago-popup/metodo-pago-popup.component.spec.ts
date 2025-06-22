import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetodoPagoPopupComponent } from './metodo-pago-popup.component';

describe('MetodoPagoPopupComponent', () => {
  let component: MetodoPagoPopupComponent;
  let fixture: ComponentFixture<MetodoPagoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetodoPagoPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetodoPagoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
