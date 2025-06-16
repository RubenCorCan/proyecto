import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { PedirService } from '../pedir.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoIniciadoGuard implements CanActivate {

  constructor(private pedirService: PedirService, private router: Router) {}

  canActivate(): boolean {
    const pedido = this.pedirService.getPedido();
    const cliente = this.pedirService.getCliente();

    if (cliente) {
      return true;
    }

    this.router.navigate(['/pedir']);
    return false;
  }

}