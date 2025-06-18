import { Component, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements AfterViewInit {

  essenzaMarqueeArray = Array(100).fill(0);

  ngAfterViewInit() {
    // --- Pizza flotante (tu lógica) ---
    const pizzas = document.querySelectorAll('.pizza-flotante');
    if (pizzas.length) {
      let targetX = 0, targetY = 0, targetR = -18;
      let currentX = 0, currentY = 0, currentR = -18;
      let targetX2 = 0, targetY2 = 0, targetR2 = 12;
      let currentX2 = 0, currentY2 = 0, currentR2 = 12;

      window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        // Pizza derecha
        targetX = (x - 0.5) * 40;
        targetY = (y - 0.5) * 40;
        targetR = -18 + (x - 0.5) * 10;
        // Albahaca izquierda
        targetX2 = (0.5 - x) * 30;
        targetY2 = (0.5 - y) * 30;
        targetR2 = 12 + (y - 0.5) * 8;
      });

      function animate() {
        // Pizza derecha
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        currentR += (targetR - currentR) * 0.08;
        // Albahaca izquierda
        currentX2 += (targetX2 - currentX2) * 0.08;
        currentY2 += (targetY2 - currentY2) * 0.08;
        currentR2 += (targetR2 - currentR2) * 0.08;

        pizzas.forEach((el: Element) => {
          if (el.classList.contains('pizza-derecha')) {
            (el as HTMLElement).style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentR}deg)`;
          } else if (el.classList.contains('pizza-izquierda')) {
            (el as HTMLElement).style.transform = `translate(${currentX2}px, ${currentY2}px) rotate(${currentR2}deg)`;
          }
        });

        requestAnimationFrame(animate);
      }
      animate();
    }

    // --- Marquee automático ---
    this.animateMarquee();
  }

  animateMarquee() {
  const marquee = document.getElementById('essenzaMarquee');
  if (!marquee) return;
  const marqueeWidth = marquee.scrollWidth / 2;
  let offset = 0;

  const step = () => {
    offset = (offset - 1) % marqueeWidth;
    marquee.style.transform = `translateX(${offset}px)`;
    requestAnimationFrame(step);
  };
  step();
}
}