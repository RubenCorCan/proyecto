import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedirRecogerCategoriaComponent } from './pedir-recoger-categoria.component';

describe('PedirRecogerCategoriaComponent', () => {
  let component: PedirRecogerCategoriaComponent;
  let fixture: ComponentFixture<PedirRecogerCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedirRecogerCategoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedirRecogerCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
