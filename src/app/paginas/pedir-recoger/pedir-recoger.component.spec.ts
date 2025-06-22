import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedirRecogerComponent } from './pedir-recoger.component';

describe('PedirRecogerComponent', () => {
  let component: PedirRecogerComponent;
  let fixture: ComponentFixture<PedirRecogerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedirRecogerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedirRecogerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
