import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirestoreService } from '../../servicios/firestore.service';
import { PedirService, PlatoPedido, DatosCliente } from '../../servicios/pedir.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MetodoPagoPopupComponent } from '../popup/metodo-pago-popup/metodo-pago-popup.component';

@Component({
  selector: 'app-pedir-recoger-categoria',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule, 
    RouterLink,
    CommonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './pedir-recoger-categoria.component.html',
  styleUrl: './pedir-recoger-categoria.component.css'
})
export class PedirRecogerCategoriaComponent implements OnInit {
  categoria: any;
  platos: any[] = [];
  private todosLosPlatos: any[] = [];
  cliente: DatosCliente | null = null;
  pedido: PlatoPedido[] = [];
  pedidoVisible = false;

  @Input() categoriaId: string = '';

  constructor(private route:ActivatedRoute, private firestoreService: FirestoreService, private pedirService: PedirService,private snackBar: MatSnackBar, private router: Router, private location: Location, private dialog: MatDialog) { }


  ngOnInit(): void {
    this.categoriaId = this.route.snapshot.paramMap.get('idCategoria') || "";
    this.firestoreService.getCategoriaById(this.categoriaId).subscribe(data => {
      this.categoria = data;
    });
    this.firestoreService.getPlatosByCategoriaId(this.categoriaId).subscribe(data => {
      this.platos = data;
    });   
    this.pedirService.cliente$.subscribe(c => this.cliente = c);
    this.pedirService.pedido$.subscribe(p => this.pedido = p); 
    this.firestoreService.getAllPlatos().subscribe(data => {
    this.todosLosPlatos = data;
  });
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
      this.snackBar.open('Error al confirmar el pedido.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error']});
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

  agregarAlPedido(plato: any) {
    this.pedirService.agregarPlato({
      id: plato.id,
      cantidad: 1,
    });
    this.snackBar.open(`${plato.nombre} añadido al pedido`, 'Cerrar', { duration: 2000, panelClass: ['snackbar-success'] });
  }

   volverAtras() {
  this.location.back();
}
}
