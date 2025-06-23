import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-atribuciones',
  imports: [CommonModule],
  templateUrl: './atribuciones.component.html',
  styleUrl: './atribuciones.component.css'
})
export class AtribucionesComponent {
  video = {
    ruta: 'imagenes/home/Video-Fondo.mp4',
  };

  homeImgs = [
    { ruta: 'imagenes/home/albahaca.png', nombre: 'Albahaca' },
    { ruta: 'imagenes/home/cargando.png', nombre: 'Cargando' },
    { ruta: 'imagenes/home/chef.jpeg', nombre: 'Chef' },
    { ruta: 'imagenes/home/equipo.jpeg', nombre: 'Equipo' },
    { ruta: 'imagenes/home/fondo-pedir.png', nombre: 'Fondo pedir' },
    { ruta: 'imagenes/home/fondo-pedir2.jpeg', nombre: 'Fondo pedir 2' },
    { ruta: 'imagenes/home/fondo-reservas.jpeg', nombre: 'Fondo reservas' },
    { ruta: 'imagenes/home/Foto2Conocenos.jpeg', nombre: 'Foto Conócenos' },
    { ruta: 'imagenes/home/pizzaFlotante.png', nombre: 'Pizza flotante' },
    { ruta: 'imagenes/home/restaurante.jpeg', nombre: 'Restaurante' }
  ];

  platosImgs = [
    { ruta: 'imagenes/platos/bistecca_fiorentina.jpeg', nombre: 'Bistecca Fiorentina' },
    { ruta: 'imagenes/platos/bruschetta.jpeg', nombre: 'Bruschetta' },
    { ruta: 'imagenes/platos/cannoli_siciliani.jpeg', nombre: 'Cannoli Siciliani' },
    { ruta: 'imagenes/platos/caprese.jpeg', nombre: 'Caprese' },
    { ruta: 'imagenes/platos/carpaccio.jpeg', nombre: 'Carpaccio' },
    { ruta: 'imagenes/platos/diavola.jpeg', nombre: 'Diavola' },
    { ruta: 'imagenes/platos/espresso.jpeg', nombre: 'Espresso' },
    { ruta: 'imagenes/platos/gelato.jpeg', nombre: 'Gelato' },
    { ruta: 'imagenes/platos/gnocchi_pesto.jpeg', nombre: 'Gnocchi Pesto' },
    { ruta: 'imagenes/platos/insalata_verde.jpeg', nombre: 'Insalata Verde' },
    { ruta: 'imagenes/platos/lasagna_bolognese.jpeg', nombre: 'Lasagna Bolognese' },
    { ruta: 'imagenes/platos/limoncello.jpeg', nombre: 'Limoncello' },
    { ruta: 'imagenes/platos/margherita.jpeg', nombre: 'Margherita' },
    { ruta: 'imagenes/platos/olive_all_ascolana.jpeg', nombre: 'Olive all\'Ascolana' },
    { ruta: 'imagenes/platos/osso_buco.jpeg', nombre: 'Osso Buco' },
    { ruta: 'imagenes/platos/panna_cotta.jpeg', nombre: 'Panna Cotta' },
    { ruta: 'imagenes/platos/patate_rosmarino.jpeg', nombre: 'Patate Rosmarino' },
    { ruta: 'imagenes/platos/pollo_cacciatora.jpeg', nombre: 'Pollo Cacciatora' },
    { ruta: 'imagenes/platos/risotto_funghi.jpeg', nombre: 'Risotto Funghi' },
    { ruta: 'imagenes/platos/saltimbocca.jpeg', nombre: 'Saltimbocca' },
    { ruta: 'imagenes/platos/spaghetti_carbonara.jpeg', nombre: 'Spaghetti Carbonara' },
    { ruta: 'imagenes/platos/tiramisu.jpeg', nombre: 'Tiramisú' },
    { ruta: 'imagenes/platos/tortellini_brodo.jpeg', nombre: 'Tortellini in Brodo' },
    { ruta: 'imagenes/platos/verdure_grigliate.jpeg', nombre: 'Verdure Grigliate' },
    { ruta: 'imagenes/platos/vino_chianti.jpeg', nombre: 'Vino Chianti' }
  ];
}