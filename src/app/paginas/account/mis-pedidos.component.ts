import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../servicios/firestore.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { CapitalizeFirstPipe } from '../../pipes/capitalize-first.pipe';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, CapitalizeFirstPipe],
  template: `
    <h2 class="pedidos-title">Mis Pedidos</h2>
    <ng-container *ngIf="pedidos$ | async as pedidos; else cargando">
      <div *ngIf="pedidos.length === 0" class="no-pedidos">No tienes pedidos registrados.</div>
      <div class="pedidos-grid">
        <div class="pedido-card" *ngFor="let pedido of pedidos">
          <div class="pedido-header">
            <div>
              <span class="pedido-fecha">{{ pedido.creado | date:'short' }}</span>
            </div>
            <span class="pedido-estado" [class.entregado]="pedido.estado === 'Entregado'">{{ pedido.estado }}</span>
          </div>

          <!-- Día y hora de recogida -->
          <div class="resumen-recogida"
     *ngIf="pedido.cliente?.fechaRecogida || pedido.cliente?.horaRecogida">
     <span class="pedido-section-title">Fecha y hora de recogida</span>
  <div class="recogida-row">
    <span class="recogida-icon-label">
      <span class="material-icons recogida-icon">event</span>
      <span class="recogida-label">Día:</span>
    </span>
    <span class="recogida-valor">
      {{ pedido.cliente.fechaRecogida | date:"EEEE, d 'de' MMMM 'de' y":"es" | lowercase | capitalizeFirst }}
    </span>
  </div>
  <div class="recogida-row">
    <span class="recogida-icon-label">
      <span class="material-icons recogida-icon">schedule</span>
      <span class="recogida-label">Hora:</span>
    </span>
    <span class="recogida-valor">
      {{ pedido.cliente.horaRecogida }}
    </span>
  </div>
</div>

          <div class="pedido-info">
            <div class="pedido-section-title">Platos</div>
            <ul class="pedido-platos">
              <li *ngFor="let plato of pedido.platos">
                <span class="plato-nombre">{{ plato.nombre }}</span>
                <span class="plato-cantidad">x{{ plato.cantidad }}</span>
                <span class="plato-precio">{{ plato.precio | currency:'EUR':'symbol' }}</span>
              </li>
            </ul>
            <div class="pedido-section-title" *ngIf="pedido.comentario">
              Comentario: <span class="pedido-comentario">{{ pedido.comentario }}</span>
            </div>
          </div>
          <div class="pedido-total-row">
            <span class="pedido-total-label">Total:</span>
            <span class="pedido-total">{{ pedido.total | currency:'EUR':'symbol' }}</span>
          </div>
          <button class="btn-cancelar" (click)="cancelarPedido(pedido)">Cancelar</button>
        </div>
      </div>
    </ng-container>
    <ng-template #cargando>
      <div class="cargando-pedidos">Cargando pedidos...</div>
    </ng-template>
  `,
  styles: [`
    .pedidos-title {
      font-family: 'Italiana', 'Playfair Display', serif;
      color: var(--primary-red, #b81426);
      font-size: 2.3rem;
      margin-bottom: 18px;
      letter-spacing: 1px;
    }
    .pedidos-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      justify-content: flex-start;
    }
    .pedido-card {
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
      transition: box-shadow 0.3s ease, transform 0.3s ease;
      position: relative;
    }
    .pedido-card:hover {
      box-shadow: 0 6px 30px var(--gold);
      transform: translateY(-4px);
    }
    .pedido-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      gap: 12px;
      border-bottom: 2px solid var(--light-gold, #f9e4b7);
      padding-bottom: 8px;
    }
    .pedido-fecha {
      font-size: 0.98rem;
      color: #888;
      font-weight: 500;
    }
    .pedido-estado {
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
    .pedido-estado.entregado {
      background: #c8e6c9;
      color: #388e3c;
    }
    /* ----------- Recogida ----------- */
    .resumen-recogida {
  background: #fffbe9;
  border-radius: 10px;
  margin: 10px 0 10px 0;
  box-shadow: 0 1px 6px #d4af3712;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  font-size: 1.08rem;
}

.recogida-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
}

.recogida-icon-label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 120px;
}

.recogida-icon {
  font-size: 1.2em;
  color: var(--primary-red, #b81426);
}

.recogida-label {
  color: var(--primary-red, #b81426);
  font-weight: 700;
  font-size: 1.05em;
}

.recogida-valor {
  color: #3a2b1c;
  font-weight: 500;
  font-size: 1.05em;
  letter-spacing: 0.2px;
  white-space: nowrap;
  margin-left: -40px;
}
    /* ----------- Fin Recogida ----------- */
    .pedido-info {
      margin-bottom: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .pedido-section {
      background: white;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 0;
      box-shadow: 0 1px 6px #d4af3712;
      border: 1px solid #f9e4b7;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pedido-section-title {
      font-size: 1.08rem;
      color: var(--primary-red, #b81426);
      font-family: 'Montserrat', Arial, sans-serif;
      font-weight: 800;
      margin-bottom: 4px;
      margin-top: 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: #f9e4b7;
      padding: 4px 10px;
      border-radius: 6px;
      box-shadow: 0 1px 4px #d4af3712;
      border-left: 4px solid var(--gold);
      display: inline-block;
    }
    .pedido-platos {
      list-style: none;
      padding: 0;
      margin: 0 0 4px 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .pedido-platos li {
      display: grid;
      grid-template-columns: 1.6fr 0.6fr 1fr;
      align-items: center;
      font-size: 1.06rem;
      padding: 7px 0 7px 0;
      border-bottom: 1.5px solid var(--gold, #d4af37); 
      background: #fff;
      transition: background 0.15s;
    }
    .pedido-platos li:nth-child(even) {
      background: #f9f6ee;
    }
    .pedido-platos li:last-child {
      border-bottom: none;
    }
    .plato-nombre {
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      color: #2d1c10;
      font-size: 1.08rem;
      letter-spacing: 0.1px;
      text-align: left;
      padding-left: 4px;
      white-space: pre-line;
    }
    .plato-cantidad {
      color: #b81426;
      font-family: 'Montserrat', Arial, sans-serif;
      font-weight: 700;
      text-align: center;
      font-size: 1.05rem;
      background: #fffbe9;
      border-radius: 8px;
      padding: 2px 8px;
      margin: 0 2px;
      min-width: 32px;
      display: inline-block;
    }
    .plato-precio {
      color: var(--gold, #d4af37);
      font-family: 'Montserrat', Arial, sans-serif;
      font-weight: 700;
      text-align: right;
      font-size: 1.07rem;
      padding-right: 4px;
    }
    .pedido-detalles {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 1rem;
      color: #3a2b1c;
    }
    .pedido-comentario {
      color: #3a2b1c;
      font-style: italic;
      font-size: 0.98rem;
      background: #fff;
      border-radius: 6px;
      padding: 6px 10px;
      border: 1px solid #f9e4b7;
    }
    .pedido-total-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      border-top: 2px solid var(--gold);
      padding-top: 10px;
      background: #fffbe9;
      border-radius: 0 0 12px 12px;
    }
    .pedido-total-label {
      font-size: 1.08rem;
      color: #b81426;
      font-weight: 700;
    }
    .pedido-total {
      font-size: 1.18rem;
      color: var(--dark-gray);
      font-weight: 900;
      letter-spacing: 1px;
    }
    .no-pedidos, .cargando-pedidos {
      color: #b81426;
      font-size: 1.1rem;
      margin: 18px 0;
      text-align: center;
    }
    @media (max-width: 700px) {
      .pedidos-grid {
        flex-direction: column;
        gap: 18px;
      }
      .pedido-card {
        min-width: 0;
        max-width: 100vw;
        padding: 14px 4vw 14px 4vw;
      }
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
  `]
})
export class MisPedidosComponent implements OnInit {
  @Input() userEmail: string = '';
  pedidos$!: Observable<any[]>;

  constructor(private firestoreService: FirestoreService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    if (this.userEmail) {
      this.pedidos$ = this.firestoreService.getPedidosByEmail(this.userEmail);
    }
  }

  cancelarPedido(pedido: any) {
    if (confirm('¿Seguro que quieres cancelar este pedido?')) {
      this.firestoreService.cancelarPedido(pedido.id).then(() => {
        this.snackBar.open('Pedido cancelado correctamente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      }).catch(() => {
        this.snackBar.open('Error al cancelar el pedido.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      });
    }
  }
  
}
