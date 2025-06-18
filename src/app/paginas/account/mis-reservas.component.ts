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
              {{ getFechaLocal(reserva.fecha) | date:'dd/MM/yyyy' }}
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
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 4px 24px #d4af3722;
      padding: 22px 28px 18px 28px;
      min-width: 300px;
      max-width: 370px;
      flex: 1 1 320px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      border: 2px solid var(--gold);
      transition: box-shadow 0.18s, border-color 0.18s;
      position: relative;
    }
    .reserva-card:hover {
      box-shadow: 0 8px 32px #d4af3722;
      border-color: var(--primary-red, #b81426);
    }
    .reserva-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      gap: 12px;
      border-bottom: 2px solid var(--light-gold, #f9e4b7);
      padding-bottom: 8px;
    }
    .reserva-fecha {
      font-weight: 700;
      color: #b81426;
      background: #ffe066;
      padding: 3px 14px;
      border-radius: 10px;
      font-size: 1rem;
      letter-spacing: 0.5px;
      min-width: 90px;
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
      align-items: center; /* Centra el contenido horizontalmente */
      justify-content: center; /* Opcional: centra verticalmente si hay altura fija */
      text-align: center;      /* Centra el texto */
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
    .no-reservas, .cargando-reservas {
      color: #b81426;
      font-size: 1.1rem;
      margin: 18px 0;
      text-align: center;
    }
    .btn-cancelar {
      margin-top: 10px;
      background: #fff;
      color: #b81426;
      border: 1.5px solid #b81426;
      border-radius: 8px;
      padding: 6px 18px;
      font-family: 'Montserrat', Arial, sans-serif;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-cancelar:hover {
      background: #b81426;
      color: #fff;
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

  getFechaLocal(fecha: string): Date {
    return new Date(fecha + 'T00:00:00');
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

  
}