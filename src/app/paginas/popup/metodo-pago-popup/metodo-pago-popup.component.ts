import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { StripePaymentComponent } from '../stripe-payment.component';

@Component({
  selector: 'app-metodo-pago-popup',
  standalone: true,
  imports: [CommonModule, MatButtonModule, StripePaymentComponent],
  templateUrl: './metodo-pago-popup.component.html',
  styleUrl: './metodo-pago-popup.component.css'
})
export class MetodoPagoPopupComponent {
  metodoPagoSeleccionado: 'tarjeta' | 'efectivo' | null = null;
  mostrarStripe = false;

  @Output() confirmado = new EventEmitter<'tarjeta' | 'efectivo'>();
  @Output() cancelado = new EventEmitter<void>();

  seleccionarMetodo(metodo: 'tarjeta' | 'efectivo') {
    this.metodoPagoSeleccionado = metodo;
    this.mostrarStripe = metodo === 'tarjeta';
  }

  confirmar() {
    if (this.metodoPagoSeleccionado) {
      this.confirmado.emit(this.metodoPagoSeleccionado);
    }
  }

  cancelar() {
    this.cancelado.emit();
  }

  registrarPedido() {
    this.confirmado.emit('tarjeta');
  }
}
