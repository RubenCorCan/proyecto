import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductosComponent } from '../productos/productos.component';
import { PedidosComponent } from '../pedidos/pedidos.component';
import { ReservasComponent } from '../reservas/reservas.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [FormsModule, ProductosComponent, PedidosComponent, ReservasComponent, CommonModule],
  templateUrl: './panelAdmin.component.html',
  styleUrls: ['./panelAdmin.component.css']
})
export class PanelAdminComponent {
  tab: 'productos' | 'pedidos' | 'reservas' = 'productos';
}