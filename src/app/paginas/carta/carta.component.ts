import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirestoreService } from '../../servicios/firestore.service';

@Component({
  selector: 'app-carta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './carta.component.html',
  styleUrl: './carta.component.css'
})
export class CartaComponent implements OnInit {
  categorias: any[] = [];
  categoriaAbierta: number | null = null;

  constructor(private firestoreService: FirestoreService) { }

  ngOnInit(): void {
    // Cargamos categorías y platos, y los agrupamos
    this.firestoreService.getCategorias().subscribe(categorias => {
      this.firestoreService.getAllPlatos().subscribe(platos => {
        // Para cada categoría, añadimos los platos que le corresponden
        this.categorias = categorias.map((cat: any) => ({
          ...cat,
          platos: platos.filter((plato: any) => plato.categoriaId === cat.id)
        }));
      });
    });
  }

  toggleCategoria(index: number) {
    this.categoriaAbierta = this.categoriaAbierta === index ? null : index;
  }
}