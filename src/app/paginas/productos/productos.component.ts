import { Component } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc, setDoc, updateDoc, collectionGroup } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";

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
  imagenSeleccionada: File | null = null;

  imagenesPublicasUrls: string[] = [];

  // Variables para modo imagen y selección de imagen pública en creación y edición
  modoImagenNuevo: 'local' | 'publica' = 'local';
  imagenPublicaSeleccionadaNuevo: string = '';

  modoImagen: 'local' | 'publica' = 'local';
  imagenPublicaSeleccionada: string = '';

  constructor(private firestore: Firestore, private currencyPipe: CurrencyPipe, private snackBar: MatSnackBar) {

    // Carga productos con categoría
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

    // Carga categorías
    const categoriasRef = collection(this.firestore, 'categorias');
    this.categorias$ = collectionData(categoriasRef, { idField: 'id' });

    // Agrupa productos por categoría
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

    // Carga las imágenes públicas desde Storage al iniciar
    this.obtenerImagenesDesdeStorage();
  }

  // Método para obtener dinámicamente las imágenes públicas en Storage
  async obtenerImagenesDesdeStorage() {
    const storage = getStorage();
    const listRef = ref(storage, 'imagenes/platos');

    try {
      const res = await listAll(listRef);
      const urls = await Promise.all(
        res.items.map(itemRef => getDownloadURL(itemRef))
      );
      this.imagenesPublicasUrls = urls;
    } catch (error) {
      console.error('Error listando imágenes:', error);
    }
  }

  async agregarProducto() {
    if (!this.nuevo.nombre || !this.nuevo.precio || !this.nuevo.categoria) return;

    const id = this.nuevo.nombre.toLowerCase().replace(/ /g, '_');
    let urlImagen = this.nuevo.imagen;

    // Decide URL según modo imagen
    if (this.modoImagenNuevo === 'local' && this.imagenSeleccionada) {
      const extension = this.imagenSeleccionada.name.split('.').pop();
      const nombreArchivo = `${id}.${extension}`;
      urlImagen = await this.subirImagen(nombreArchivo, this.imagenSeleccionada);
    } else if (this.modoImagenNuevo === 'publica' && this.imagenPublicaSeleccionadaNuevo) {
      urlImagen = this.imagenPublicaSeleccionadaNuevo;
    }

    const productoDoc = doc(this.firestore, `categorias/${this.nuevo.categoria}/platos/${id}`);
    await setDoc(productoDoc, {
      nombre: this.nuevo.nombre,
      precio: this.nuevo.precio,
      imagen: urlImagen,
      descripcion: this.nuevo.descripcion,
      ingredientes: this.nuevo.ingredientes.split(',').map((i: string) => i.trim()),
      categoriaId: this.nuevo.categoria
    });

    this.snackBar.open('Producto agregado correctamente', 'Cerrar', { duration: 2000, panelClass: 'snackbar-success' });
    this.nuevo = { nombre: '', precio: 0, imagen: '', descripcion: '', categoria: '', ingredientes: '' };
    this.mostrarFormNuevo = false;
    this.imagenSeleccionada = null;
    this.modoImagenNuevo = 'local';
    this.imagenPublicaSeleccionadaNuevo = '';
  }

  async subirImagen(nombreArchivo: string, archivo: File): Promise<string> {
    const storage = getStorage();
    const referencia = ref(storage, `imagenes/platos/${nombreArchivo}`);
    await uploadBytes(referencia, archivo);
    const url = await getDownloadURL(referencia);
    return url;
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
    if (!categoriaId && producto.path) {
      const match = producto.path.match(/categorias\/([^/]+)\/platos\/[^/]+/);
      if (match) categoriaId = match[1];
    }
    if (!categoriaId) {
      alert('Este producto no tiene categoría asignada y no puede editarse. Debes borrarlo y crearlo de nuevo.');
      return;
    }
    this.editandoProducto = { ...producto, categoriaId, categoriaIdOriginal: categoriaId };

    // Reset variables de imagen para edición
    this.modoImagen = 'local';
    this.imagenPublicaSeleccionada = '';
    this.imagenSeleccionada = null;
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.editandoProducto = {};
    this.imagenSeleccionada = null;
    this.modoImagen = 'local';
    this.imagenPublicaSeleccionada = '';
  }

  async guardarEdicion(id: string) {
    const oldCategoriaId = this.editandoProducto.categoriaIdOriginal;
    const newCategoriaId = this.editandoProducto.categoriaId;

    const oldDocRef = doc(this.firestore, `categorias/${oldCategoriaId}/platos/${id}`);
    const newDocRef = doc(this.firestore, `categorias/${newCategoriaId}/platos/${id}`);

    const data: any = {
      nombre: this.editandoProducto.nombre,
      precio: this.editandoProducto.precio,
      descripcion: this.editandoProducto.descripcion,
      ingredientes: Array.isArray(this.editandoProducto.ingredientes)
        ? this.editandoProducto.ingredientes
        : (this.editandoProducto.ingredientes || '').split(',').map((i: string) => i.trim()),
      categoriaId: newCategoriaId
    };

    // Asignar imagen según modo
    if (this.modoImagen === 'local' && this.imagenSeleccionada) {
      const extension = this.imagenSeleccionada.name.split('.').pop();
      const nombreArchivo = `${id}.${extension}`;
      data.imagen = await this.subirImagen(nombreArchivo, this.imagenSeleccionada);
    } else if (this.modoImagen === 'publica' && this.imagenPublicaSeleccionada) {
      data.imagen = this.imagenPublicaSeleccionada;
    } else {
      data.imagen = this.editandoProducto.imagen; // mantener la que ya tenía
    }

    try {
      if (oldCategoriaId !== newCategoriaId) {
        await setDoc(newDocRef, data);
        await deleteDoc(oldDocRef);
      } else {
        await updateDoc(newDocRef, data);
      }
      this.snackBar.open('Producto editado correctamente', 'Cerrar', { duration: 2000, panelClass: 'snackbar-success' });
      this.cancelarEdicion();
    } catch (error) {
      this.snackBar.open('Error al guardar la edición', 'Cerrar', { duration: 2000, panelClass: 'snackbar-error' });
    }
  }

  onArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
    }
  }
}