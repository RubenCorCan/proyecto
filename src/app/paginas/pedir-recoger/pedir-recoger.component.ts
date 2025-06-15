import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FirestoreService } from '../../servicios/firestore.service';
import { PedirService, PlatoPedido, DatosCliente } from '../../servicios/pedir.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MetodoPagoPopupComponent } from '../popup/metodo-pago-popup/metodo-pago-popup.component';

@Component({
  selector: 'app-pedir-recoger',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './pedir-recoger.component.html',
  styleUrl: './pedir-recoger.component.css'
})
export class PedirRecogerComponent implements OnInit {
  platos: any[] = [];
  categorias: any[] = [];
  cliente: DatosCliente | null = null;
  pedido: PlatoPedido[] = [];
  pedidoVisible = false;
  selectedTab = 0;

  mensaje: string = '';
  mensajeTimeout: any;

  // Carrusel
  activeIndex = 0;
  animatingSide: 'left' | 'right' | '' = '';
outIndex: number | null = null;
outDirection: 'left' | 'right' | '' = '';

  constructor(
    private firestoreService: FirestoreService,
    private pedirService: PedirService,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.firestoreService.getAllPlatos().subscribe(data => {
      this.platos = data;
      if (this.activeIndex >= this.platos.length) {
        this.activeIndex = 0;
      }
    });
    this.firestoreService.getCategorias().subscribe(data => this.categorias = data);

    this.pedirService.cliente$.subscribe(c => this.cliente = c);
    this.pedirService.pedido$.subscribe(p => this.pedido = p);
  }

  agregarAlPedido(plato: any): void {
    this.pedirService.agregarPlato({
      id: plato.id,
      nombre: plato.nombre,
      imagen: plato.imagen,
      cantidad: 1,
      precio: plato.precio
    });
  }

  cambiarCantidad(platoId: string, cantidad: number) {
    this.pedirService.cambiarCantidad(platoId, cantidad);
  }

  quitarPlato(platoId: string) {
    this.pedirService.quitarPlato(platoId);
  }

  cancelarPedido() {
    this.pedirService.cancelarPedido();
    this.snackBar.open('Pedido cancelado', 'Cerrar', { duration: 3000, panelClass: ['snackbar-cancel'] });
    this.router.navigate(['/pedir']);
  }

  finalizarPedido() {
    if (this.pedido.length === 0) {
      this.snackBar.open('Tu carrito está vacío.', 'Cerrar', { duration: 3000 });
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
    if (!pedidoId) {
      this.snackBar.open('No se encontró el pedido. Vuelve a iniciar el proceso.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.firestoreService.actualizarPedidoConPlatos(pedidoId, this.pedido, metodo).then(() => {
      this.snackBar.open(`Pedido finalizado con éxito pagando con ${metodo}. ¡Gracias!`, 'Cerrar', { duration: 3000 });
      this.pedirService.cancelarPedido();
      this.router.navigate(['/pedir/mipedido/finalizado']);
    }).catch((error) => {
      console.error('Error actualizando pedido con platos:', error);
      this.snackBar.open('Hubo un error al finalizar el pedido.', 'Cerrar', { duration: 3000 });
    });
  }

  togglePedido() {
    this.pedidoVisible = !this.pedidoVisible;
  }

  getTotal(): number {
    return this.pedido.reduce((acc, plato) => acc + plato.precio * plato.cantidad, 0);
  }

  // --- Carrusel infinito ---
prevPlato() {
  if (!this.platos.length) return;
  this.animatingSide = 'left';
  this.outDirection = 'right';
  this.outIndex = (this.activeIndex + 1) % this.platos.length; // el que está en la derecha
  this.activeIndex = (this.activeIndex - 1 + this.platos.length) % this.platos.length;
  setTimeout(() => {
    this.animatingSide = '';
    this.outIndex = null;
    this.outDirection = '';
  }, 400);
}

nextPlato() {
  if (!this.platos.length) return;
  this.animatingSide = 'right';
  this.outDirection = 'left';
  this.outIndex = (this.activeIndex - 1 + this.platos.length) % this.platos.length; // el que está en la izquierda
  this.activeIndex = (this.activeIndex + 1) % this.platos.length;
  setTimeout(() => {
    this.animatingSide = '';
    this.outIndex = null;
    this.outDirection = '';
  }, 400);
}

getCarruselPlatos() {
  const n = this.platos.length;
  if (n === 0) return [];
  return this.platos.map((plato, i) => {
    let pos = '';
    if (n === 1) {
      pos = 'center';
    } else if (n === 2) {
      if (i === this.activeIndex) pos = 'center';
      else pos = 'left';
    } else {
      if (i === this.activeIndex) pos = 'center';
      else if (i === (this.activeIndex - 1 + n) % n) pos = 'left';
      else if (i === (this.activeIndex + 1) % n) pos = 'right';
      else pos = '';
    }

    // Animación de entrada
    let animClass = '';
    let animationKey = '';
    if (this.animatingSide === 'right' && pos === 'right' && i === (this.activeIndex + 1) % n) {
      animClass = 'anim-right-in';
      animationKey = 'right-in-' + Date.now(); // fuerza re-render
    }
    if (this.animatingSide === 'left' && pos === 'left' && i === (this.activeIndex - 1 + n) % n) {
      animClass = 'anim-left-in';
      animationKey = 'left-in-' + Date.now();
    }
    // Animación de salida
    if (this.outIndex === i && this.outDirection === 'right') {
      animClass = 'anim-out-right';
      animationKey = 'out-right-' + Date.now();
    }
    if (this.outIndex === i && this.outDirection === 'left') {
      animClass = 'anim-out-left';
      animationKey = 'out-left-' + Date.now();
    }

    return { ...plato, pos, key: i + '-' + animationKey, animClass };
  });
}
  trackByKey(index: number, item: any) {
    return item.key;
  }

  
}