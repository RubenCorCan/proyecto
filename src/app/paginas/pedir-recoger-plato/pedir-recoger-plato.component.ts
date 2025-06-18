import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirestoreService } from '../../servicios/firestore.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DatosCliente, PedirService, PlatoPedido } from '../../servicios/pedir.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MetodoPagoPopupComponent } from '../popup/metodo-pago-popup/metodo-pago-popup.component';

@Component({
  selector: 'app-pedir-recoger-plato',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './pedir-recoger-plato.component.html',
  styleUrl: './pedir-recoger-plato.component.css'
})
export class PedirRecogerPlatoComponent {
  plato: any;
  platos: any[] = [];
  private todosLosPlatos: any[] = [];
  cliente: DatosCliente| null = null;
  pedido: PlatoPedido[] = [];
  
  pedidoVisible = false;

  @Input() platoId: any;
  @Input() categoriaId: any;

  constructor(private route:ActivatedRoute, private firestoreService: FirestoreService, private pedirService: PedirService, private snackBar: MatSnackBar, private router: Router, private location: Location, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.platoId = this.route.snapshot.paramMap.get('idPlato') || "";
    this.categoriaId = this.route.snapshot.paramMap.get('idCategoria') || "";
    this.firestoreService.getPlatoById(this.categoriaId, this.platoId).subscribe(data => {
      this.plato = data;
    });
    this.pedirService.cliente$.subscribe(c => this.cliente = c);
    this.pedirService.pedido$.subscribe(p => this.pedido = p);
    this.firestoreService.getAllPlatos().subscribe(data => {
    this.todosLosPlatos = data;
  });
  }
  agregarAlPedido(plato: any) {
    this.pedirService.agregarPlato({
      id: plato.id,
      cantidad: 1,
    });
    this.snackBar.open(`${plato.nombre} añadido al pedido`, 'Cerrar', { duration: 2000, panelClass: ['snackbar-success'] });
  }

   cambiarCantidad(platoId: string, cantidad: number) {
    this.pedirService.cambiarCantidad(platoId, cantidad);
  }

  quitarPlato(platoId: string) {
    this.pedirService.quitarPlato(platoId);
  }

  async cancelarPedido() {
    const pedidoId = this.pedirService.getPedidoId();
    if (!pedidoId) {
      this.snackBar.open('No se encontró el pedido para cancelar.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
      return;
    }

    try {
      await this.firestoreService.borrarPedido(pedidoId);
      this.pedirService.cancelarPedido();
      this.snackBar.open('Pedido eliminado correctamente.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
      this.router.navigate(['/pedir']);
    } catch (error) {
      this.snackBar.open('Error al eliminar el pedido.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
    }
  }

  finalizarPedido() {
      if (this.pedido.length === 0) {
        this.snackBar.open('Tu carrito está vacío.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-warning'] });
        return;
      }
      const dialogRef = this.dialog.open(MetodoPagoPopupComponent);
  
      dialogRef.componentInstance.confirmado.subscribe((metodo: 'tarjeta' | 'efectivo') => {
        dialogRef.close();
        this.confirmarPago(metodo);
      });
  
      dialogRef.componentInstance.cancelado.subscribe(() => {
        dialogRef.close();
      });
    }
  
confirmarPago(metodo: 'tarjeta' | 'efectivo') {
  const pedidoId = this.pedirService.getPedidoId();
  const pedido = this.pedirService.getPedido();

  if (!pedidoId || !pedido.length) {
    this.snackBar.open('No se encontró el pedido. Vuelve a iniciar el proceso.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
    return;
  }

  this.firestoreService.actualizarPedidoConPlatos(pedidoId, pedido, metodo)
    .then(async () => {
      this.snackBar.open(`Pedido confirmado pagando con ${metodo}. ¡Gracias!`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
      this.pedirService.cancelarPedido();
      this.router.navigate(['/pedir']);
    })
    .catch(() => {
      this.snackBar.open('Error al confirmar el pedido.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
    });
}

  togglePedido() {
    this.pedidoVisible = !this.pedidoVisible;
  }

  getTotal(): number {
    let total = 0;

    for (const pedidoPlato of this.pedido) {
      const plato = this.todosLosPlatos.find(p => p.id === pedidoPlato.id);
      if (plato && plato.precio) {
        total += plato.precio * pedidoPlato.cantidad;
      }
    }

    return total;
  }

  getPlatoCompleto(platoId: string) {
    return this.todosLosPlatos.find(p => p.id === platoId);
  }

  volverAtras() {
  this.location.back();
}
}
