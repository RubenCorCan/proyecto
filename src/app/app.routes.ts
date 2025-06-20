import { Routes } from '@angular/router'; 
import { AuthGuard } from './servicios/guard/auth.guard';  
import { RegisterComponent } from './paginas/register/register.component';
import { AccountComponent } from './paginas/account/account.component';
import { LoginComponent } from './paginas/login/login.component';
import { InicioComponent } from './paginas/inicio/inicio.component';
import { ConocenosComponent } from './paginas/conocenos/conocenos.component';
import { CartaComponent } from './paginas/carta/carta.component';
import { ReservaComponent } from './paginas/reserva/reserva.component';
import { PedirComponent } from './paginas/pedir/pedir.component';
import { PedirRecogerComponent } from './paginas/pedir-recoger/pedir-recoger.component';
import { PedirRecogerCategoriaComponent } from './paginas/pedir-recoger-categoria/pedir-recoger-categoria.component';
import { PedirRecogerPlatoComponent } from './paginas/pedir-recoger-plato/pedir-recoger-plato.component';
import { PedidoIniciadoGuard } from './servicios/guard/pedido-iniciado.guard';
import { AtribucionesComponent } from './paginas/atribuciones/atribuciones.component';
import { AdminGuard } from './servicios/guard/adminguard';
import { AdminLoginComponent } from './paginas/admin/admin.component';
import { PanelAdminComponent } from './paginas/panelAdmin/panelAdmin.component';
import { ProductosComponent } from './paginas/productos/productos.component';
import { PedidosComponent } from './paginas/pedidos/pedidos.component';
import { ReservasComponent } from './paginas/reservas/reservas.component';
export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent }, 
    { path: 'inicio', component: InicioComponent },
    { path: 'conocenos', component: ConocenosComponent },
    { path: 'carta', component: CartaComponent },
    { path: 'reserva', component: ReservaComponent },
    { path: 'pedir', component: PedirComponent },
    {
      path: 'pedir/mipedido',
      canActivate: [PedidoIniciadoGuard],
      component: PedirRecogerComponent
    },
    {
      path: 'pedir/mipedido/:idCategoria',
      canActivate: [PedidoIniciadoGuard],
      component: PedirRecogerCategoriaComponent
    },
    {
      path: 'pedir/mipedido/:idCategoria/:idPlato',
      canActivate: [PedidoIniciadoGuard],
      component: PedirRecogerPlatoComponent
    },
    {
      path: 'atribuciones',
      component: AtribucionesComponent
    },
    { path: 'admin', component: AdminLoginComponent },
    { path: 'panelAdmin', component: PanelAdminComponent, canActivate: [AdminGuard] },
    { path: 'productos', component: ProductosComponent },
    { path: 'pedidos', component: PedidosComponent },
    { path: 'reservas', component: ReservasComponent },
    { path: '', redirectTo: '/inicio', pathMatch: 'full' }
  ];  
