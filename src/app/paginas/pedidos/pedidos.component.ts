import { Component } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent {
  pedidos$: Observable<any[]>;

  constructor(private firestore: Firestore, private snackBar: MatSnackBar) {
    const pedidosRef = collection(this.firestore, 'pedidos');
    this.pedidos$ = collectionData(pedidosRef, { idField: 'id' });
  }

  borrarPedido(id: string) {
    const pedidoDoc = doc(this.firestore, `pedidos/${id}`);
    this.snackBar.open('Pedido eliminado correctamente.', 'Cerrar', {
      duration: 2000,
      panelClass: ['snackbar-success']
    });
    return deleteDoc(pedidoDoc);
  }

  getFechaFormateada(fecha: string | Date): string {
  const f = new Date(fecha);
  const str = f.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}
getHoraFormateada(fecha: string | Date): string {
  const f = new Date(fecha);
  return f.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
}