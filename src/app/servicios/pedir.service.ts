import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PlatoPedido {
  id: string;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export interface DatosCliente {
  nombre: string;
  telefono?: string;
  email: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedirService {
  private clienteSubject = new BehaviorSubject<DatosCliente | null>(this.loadCliente());
  cliente$ = this.clienteSubject.asObservable();

  private pedidoSubject = new BehaviorSubject<PlatoPedido[]>(this.loadPedido());
  pedido$ = this.pedidoSubject.asObservable();

  private pedidoId: string | null = this.loadPedidoId();

  setPedidoId(id: string) {
    this.pedidoId = id;
    localStorage.setItem('pedidoId', id);
  }

  getPedidoId(): string | null {
    return this.pedidoId;
  }

  getPedido(): PlatoPedido[] {
    return this.pedidoSubject.value;
  }

  setPedido(pedido: PlatoPedido[]) {
    this.pedidoSubject.next(pedido);
    this.savePedido(pedido);
  }

  setCliente(datos: DatosCliente) {
    this.clienteSubject.next(datos);
    localStorage.setItem('cliente', JSON.stringify(datos));
  }

  getCliente(): DatosCliente | null {
    return this.clienteSubject.value;
  }

  agregarPlato(plato: PlatoPedido) {
    const pedido = [...this.pedidoSubject.value];
    const index = pedido.findIndex(p => p.id === plato.id);

    if (index !== -1) {
      pedido[index].cantidad += plato.cantidad;
    } else {
      pedido.push(plato);
    }

    this.pedidoSubject.next(pedido);
    this.savePedido(pedido);
  }

  cambiarCantidad(platoId: string, cantidad: number) {
    const pedido = [...this.pedidoSubject.value];
    const index = pedido.findIndex(p => p.id === platoId);

    if (index !== -1) {
      if (cantidad <= 0) {
        pedido.splice(index, 1);
      } else {
        pedido[index].cantidad = cantidad;
      }
      this.pedidoSubject.next(pedido);
      this.savePedido(pedido);
    }
  }

  quitarPlato(platoId: string) {
    const pedido = this.pedidoSubject.value.filter(p => p.id !== platoId);
    this.pedidoSubject.next(pedido);
    this.savePedido(pedido);
  }

  cancelarPedido() {
    this.clienteSubject.next(null);
    this.pedidoSubject.next([]);
    this.pedidoId = null;
    localStorage.removeItem('pedidoId');
    localStorage.removeItem('cliente');
    localStorage.removeItem('pedido');
  }

  private savePedido(pedido: PlatoPedido[]) {
    localStorage.setItem('pedido', JSON.stringify(pedido));
  }

  private loadPedido(): PlatoPedido[] {
    const pedidoStr = localStorage.getItem('pedido');
    return pedidoStr ? JSON.parse(pedidoStr) : [];
  }

  private loadCliente(): DatosCliente | null {
    const clienteStr = localStorage.getItem('cliente');
    return clienteStr ? JSON.parse(clienteStr) : null;
  }

  private loadPedidoId(): string | null {
    return localStorage.getItem('pedidoId');
  }
}