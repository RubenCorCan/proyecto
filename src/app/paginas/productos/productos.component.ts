import { Component } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc, setDoc, updateDoc, collectionGroup } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent {
  productos$: Observable<any[]>;
  categorias$: Observable<any[]>;
  nuevo = { nombre: '', precio: 0, imagen: '', descripcion: '', categoria: '', ingredientes: '' };
  mostrarFormNuevo = false;
  productosPorCategoria$: Observable<{ [categoriaId: string]: any[] }>;
  editandoId: string | null = null;
  editandoProducto: any = {};

  constructor(private firestore: Firestore, private currencyPipe: CurrencyPipe, private snackBar: MatSnackBar) {

    const platosRef = collectionGroup(this.firestore, 'platos');
    this.productos$ = collectionData(platosRef, { idField: 'id' }).pipe(
  map(productos => productos.map(p => {
    let path = '';
    if ((p as any).__snapshot__?.ref?.path) {
      path = (p as any).__snapshot__?.ref?.path;
    } else if ((p as any)._document?.key?.path?.segments) {
      path = (p as any)._document.key.path.segments.join('/');
    }
    let categoriaId = '';
    if (path) {
      const match = path.match(/categorias\/([^/]+)\/platos\/[^/]+/);
      if (match) categoriaId = match[1];
    }
    if (!categoriaId && (p as any).categoriaId) {
      categoriaId = (p as any).categoriaId;
    }
    return { ...p, categoriaId, path };
  }))
);
    const categoriasRef = collection(this.firestore, 'categorias');
  this.categorias$ = collectionData(categoriasRef, { idField: 'id' });

  this.productosPorCategoria$ = this.productos$.pipe(
    map(productos => {
      const grouped: { [categoriaId: string]: any[] } = {};
      for (const p of productos) {
        if (!grouped[p.categoriaId]) grouped[p.categoriaId] = [];
        grouped[p.categoriaId].push(p);
      }
      return grouped;
    })
  );
  }

  agregarProducto() {
  if (!this.nuevo.nombre || !this.nuevo.precio || !this.nuevo.categoria) return;
  const id = this.nuevo.nombre.toLowerCase().replace(/ /g, '_');
  const productoDoc = doc(this.firestore, `categorias/${this.nuevo.categoria}/platos/${id}`);
  setDoc(productoDoc, {
    nombre: this.nuevo.nombre,
    precio: this.nuevo.precio,
    imagen: this.nuevo.imagen,
    descripcion: this.nuevo.descripcion,
    ingredientes: this.nuevo.ingredientes.split(',').map((i: string) => i.trim()),
    categoriaId: this.nuevo.categoria
  }).then(() => {
    this.snackBar.open('Producto agregado correctamente', 'Cerrar', { duration: 2000, panelClass: 'snackbar-success' });
    this.nuevo = { nombre: '', precio: 0, imagen: '', descripcion: '', categoria: '', ingredientes: '' };
    this.mostrarFormNuevo = false;
  });
}

 borrarProducto(producto: any) {
  if (!producto.categoriaId || !producto.id) {
    console.warn('Faltan datos para borrar');
    return;
  }
  const productoDoc = doc(this.firestore, `categorias/${producto.categoriaId}/platos/${producto.id}`);
  deleteDoc(productoDoc).then(() => {
    this.snackBar.open('Producto borrado correctamente', 'Cerrar', { duration: 2000, panelClass: 'snackbar-success' });
  });
}

  getPrecio(precio: number) {
    return this.currencyPipe.transform(precio, 'EUR');
  }

  empezarEdicion(producto: any) {
  this.editandoId = producto.id;
  let categoriaId = producto.categoriaId;
  // Intenta extraer del path si no hay categoriaId
  if (!categoriaId && producto.path) {
    const match = producto.path.match(/categorias\/([^/]+)\/platos\/[^/]+/);
    if (match) categoriaId = match[1];
  }
  // Si sigue sin haber categoriaId, AVISA y no dejes editar
  if (!categoriaId) {
    alert('Este producto no tiene categoría asignada y no puede editarse. Debes borrarlo y crearlo de nuevo.');
    return;
  }
  this.editandoProducto = { ...producto, categoriaId, categoriaIdOriginal: categoriaId };
}

  cancelarEdicion() {
    this.editandoId = null;
    this.editandoProducto = {};
  }

  async guardarEdicion(id: string) {
  // ...
  const oldCategoriaId = this.editandoProducto.categoriaIdOriginal;
  const newCategoriaId = this.editandoProducto.categoriaId;

  const oldDocRef = doc(this.firestore, `categorias/${oldCategoriaId}/platos/${id}`);
  const newDocRef = doc(this.firestore, `categorias/${newCategoriaId}/platos/${id}`);

  const data = {
    nombre: this.editandoProducto.nombre,
    precio: this.editandoProducto.precio,
    imagen: this.editandoProducto.imagen,
    descripcion: this.editandoProducto.descripcion,
    ingredientes: Array.isArray(this.editandoProducto.ingredientes)
      ? this.editandoProducto.ingredientes
      : (this.editandoProducto.ingredientes || '').split(',').map((i: string) => i.trim()),
    categoriaId: newCategoriaId
  };

  try {
    if (oldCategoriaId !== newCategoriaId) {
      // Mover: crear en nueva categoría y borrar el antiguo
      await setDoc(newDocRef, data);
      await deleteDoc(oldDocRef);
    } else {
      // Solo actualizar
      await updateDoc(newDocRef, data);
    }
    this.snackBar.open('Producto editado correctamente', 'Cerrar', { duration: 2000, panelClass: 'snackbar-success' });
    this.cancelarEdicion();
  } catch (error) {
    this.snackBar.open('Error al guardar la edición', 'Cerrar', { duration: 2000, panelClass: 'snackbar-error' });
  }
}


}