import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.css']
})
export class StripePaymentComponent implements OnInit {
  @ViewChild('cardElement') cardElement!: ElementRef;
  @Output() pagoAceptado = new EventEmitter<void>();
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  loading = false;

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51RLAE7Pd94m6kttQxURJK9XoERjJaCLlRAd9ZzImy9FAZvk4eE7ptNuKLIusL2gNcfLcRpmTZsvWtbDFrXScbMO300VovesHEJ');
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.card = this.elements.create('card');
      this.card.mount(this.cardElement.nativeElement);
      this.card.on('change', async (event: any) => {
        if (event.complete) {
          await this.pay();
        }
      });
    }
  }

  async pay() {
    if (!this.stripe || !this.card) return;
    const {error} = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
    });
    if (!error) {
      this.pagoAceptado.emit();
    }
  }
}
