import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../servicios/firestore.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 class="reservas-title">Mis Reservas</h2>
    <ng-container *ngIf="reservas$ | async as reservas; else cargando">
      <div *ngIf="reservas.length === 0" class="no-reservas">No tienes reservas registradas.</div>
      <div class="reservas-grid">
        <div class="reserva-card" *ngFor="let reserva of reservas">
          <div class="reserva-header">
            <span class="reserva-fecha">
            {{ getFechaFormateada(reserva.fecha) }}
            </span>
            <span class="reserva-hora">{{ reserva.hora }}</span>
          </div>
          <div class="reserva-detalles">
            <div><strong>Personas:</strong> {{ reserva.personas }}</div>
            <div *ngIf="reserva.mesa"><strong>Mesa:</strong> {{ reserva.mesa }}</div>
          </div>
          <button class="btn-cancelar" (click)="cancelarReserva(reserva)">Cancelar</button>
        </div>
      </div>
    </ng-container>
    <ng-template #cargando>
      <div class="cargando-reservas">Cargando reservas...</div>
    </ng-template>
  `,
  styles: [`
    .reservas-title {
      font-family: 'Italiana', 'Playfair Display', serif;
      color: var(--primary-red, #b81426);
      font-size: 2.3rem;
      margin-bottom: 18px;
      letter-spacing: 1px;
    }
    .reservas-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      justify-content: flex-start;
    }
    .reserva-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 4px 24px #0001;
  border: 2px solid var(--gold, #d4af37);
  padding: 28px 28px 20px 28px;
  min-width: 320px;
  max-width: 400px;
  font-family: 'Montserrat', 'Lato', sans-serif;
  color: var(--dark-gray, #333);
  position: relative;
  margin-bottom: 12px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;  
}
.reserva-card:hover {
  box-shadow: 0 6px 30px var(--gold);
      transform: translateY(-4px);
}
.reserva-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 2px solid var(--light-gold, #f9e4b7);
  padding-bottom: 8px;
}
.reserva-fecha {
  font-weight: 700;
  color: var(--primary-red, #b81426);
  background: var(--light-gold, #f9e4b7);
  padding: 3px 14px;
  border-radius: 10px;
  font-size: 1rem;
  letter-spacing: 0.5px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 1px 4px #d4af3722;
}
.reserva-hora {
  font-size: 1rem;
  color: #3a2b1c;
  font-weight: 600;
  background: #f7e7c1;
  padding: 3px 14px;
  border-radius: 10px;
  margin-left: 8px;
  min-width: 70px;
  text-align: center;
  box-shadow: 0 1px 4px #d4af3712;
}
.reserva-detalles {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fffbe9;
  padding: 12px 16px;
  font-size: 1.07rem;
  color: #3a2b1c;
  align-items: center;
  border-radius: 10px;
  border: 1px solid var(--light-gold, #f9e4b7);
}
.reserva-detalles div {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Montserrat', Arial, sans-serif;
  font-weight: 600;
}
.reserva-detalles strong {
  color: var(--primary-red, #b81426);
  font-weight: 800;
  font-size: 1.05rem;
  min-width: 80px;
  letter-spacing: 0.5px;
}
.btn-cancelar {
  margin-top: 10px;
  background: transparent;
  color: var(--primary-red, #b81426);
  border: 2px solid var(--primary-red, #b81426);
  border-radius: 8px;
  padding: 10px 0;
  font-family: 'Montserrat', Arial, sans-serif;
  font-weight: bold;
  width: 100%;
  font-size: 1.08rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.btn-cancelar:hover {
  background: var(--primary-red, #b81426);
  color: var(--gold, #d4af37);
}
.no-reservas, .cargando-reservas {
      color: #b81426;
      font-size: 1.1rem;
      margin: 18px 0;
      text-align: center;
    }
    
    @media (max-width: 700px) {
      .reservas-grid {
        flex-direction: column;
        gap: 18px;
      }
      .reserva-card {
        min-width: 0;
        max-width: 100vw;
        padding: 14px 4vw 14px 4vw;
      }
    }
  `]
})
export class MisReservasComponent implements OnInit {
  @Input() userEmail: string = '';
  reservas$!: Observable<any[]>;

  constructor(private firestoreService: FirestoreService, private snackBar: MatSnackBar) {}

  async ngOnInit() {
    if (this.userEmail) {
    this.reservas$ = this.firestoreService.getReservasByEmail(this.userEmail);
  }
  }
  cancelarReserva(reserva: any) {
    if (confirm('¿Seguro que quieres cancelar esta reserva?')) {
      this.firestoreService.cancelarReserva(reserva.id).then(() => {
        this.snackBar.open('Reserva cancelada correctamente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      }).catch(() => {
        this.snackBar.open('Error al cancelar la reserva.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      });
    }
  }

  getFechaFormateada(fecha: string): string {
  const f = new Date(fecha + 'T00:00:00');
  const str = f.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}
}