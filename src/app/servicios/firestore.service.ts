import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, getDocs, query, where, addDoc } from '@angular/fire/firestore';
import { getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DatosCliente, PlatoPedido } from './pedir.service';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore, private auth: Auth) {}

  getCategorias(): Observable<any[]> {
    const categoriasRef = collection(this.firestore, 'categorias');
    return collectionData(categoriasRef, { idField: 'id' });
  }

  getAllPlatos(): Observable<any[]> {
    const categoriasRef = collection(this.firestore, 'categorias');
    return collectionData(categoriasRef, { idField: 'id' }).pipe(
      switchMap(async (categorias: any[]) => {
        const allPlatoObservables = categorias.map(async (categoria) => {
          const platosSnap = await getDocs(collection(this.firestore, `categorias/${categoria.id}/platos`));
          return platosSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), categoriaId: categoria.id }));
        });

        const platosArrays = await Promise.all(allPlatoObservables);
        return platosArrays.flat();
      })
    );
  }

  getPlatoById(categoriaId: string, platoId: string): Observable<any | null> {
    const platoRef = doc(this.firestore, `categorias/${categoriaId}/platos/${platoId}`);
    return docData(platoRef, { idField: 'id' }).pipe(
      map((data) => (data ? { ...data, categoriaId } : null))
    );
  }

  getCategoriaById(categoriaId: string): Observable<any | null> {
    const categoriaRef = doc(this.firestore, `categorias/${categoriaId}`);
    return docData(categoriaRef, { idField: 'id' }).pipe(
      map((data) => (data ? data : null))
    );
  }

  getPlatosByCategoriaId(categoriaId: string): Observable<any[]> {
    const platosRef = collection(this.firestore, `categorias/${categoriaId}/platos`);
    return collectionData(platosRef, { idField: 'id' }).pipe(
      map(platos => platos.map(plato => ({ ...plato, categoriaId })))
    );
  }

  async existeReserva(fecha: string, hora: string): Promise<boolean> {
    const reservasRef = collection(this.firestore, 'reservas');
    const q = query(reservasRef, where('fecha', '==', fecha), where('hora', '==', hora));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async existeReservaMesa(fecha: string, hora: string, mesa: string): Promise<boolean> {
    const reservasRef = collection(this.firestore, 'reservas');
    const q = query(reservasRef, where('fecha', '==', fecha), where('hora', '==', hora), where('mesa', '==', mesa));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async guardarReserva(reserva: any): Promise<void> {
    const reservasRef = collection(this.firestore, 'reservas');
    await addDoc(reservasRef, reserva);
  }

  async getReservasPorTurno(fecha: string, inicio: string, fin: string): Promise<any[]> {
    const reservasRef = collection(this.firestore, 'reservas');
    const q = query(reservasRef, where('fecha', '==', fecha));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map(doc => doc.data())
      .filter((r: any) => {
        const [h, m] = (r.hora || '').split(':').map(Number);
        const [hi, mi] = inicio.split(':').map(Number);
        let [hf, mf] = fin.split(':').map(Number);
        if (fin === '00:00') { hf = 24; }
        const minutos = h * 60 + m;
        const minInicio = hi * 60 + mi;
        const minFin = hf * 60 + mf;
        return minutos >= minInicio && minutos < minFin;
      });
  }

  async getAforo(): Promise<any> {
    const aforoRef = doc(this.firestore, 'aforo/aforo');
    const aforoSnap = await getDoc(aforoRef);
    return aforoSnap.exists() ? aforoSnap.data() : { maxComensales: 40, mesas: [1,2,3,4,5,6,7,8,9,10] };
  }

  async getReservasPorFechaHora(fecha: string, hora: string): Promise<any[]> {
    const reservasRef = collection(this.firestore, 'reservas');
    const q = query(reservasRef, where('fecha', '==', fecha), where('hora', '==', hora));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  async crearPedidoCliente(datosCliente: DatosCliente): Promise<string> {
  const pedidosRef = collection(this.firestore, 'pedidos');
  const docRef = await addDoc(pedidosRef, {
    cliente: datosCliente,
    estado: 'pendiente',
    creado: new Date().toISOString(),
  });
  return docRef.id;
}

  async actualizarPedidoConPlatos(pedidoId: string,pedidoGuardado: PlatoPedido[],metodoPago: 'efectivo' | 'tarjeta'
  ): Promise<void> {
    const categoriasSnap = await getDocs(collection(this.firestore, 'categorias'));
    const platos: any[] = [];
    let total = 0;

    for (const categoriaDoc of categoriasSnap.docs) {
      const categoriaId = categoriaDoc.id;
      const platosSnap = await getDocs(collection(this.firestore, `categorias/${categoriaId}/platos`));

      for (const platoDoc of platosSnap.docs) {
        const id = platoDoc.id;
        const guardado = pedidoGuardado.find(p => p.id === id);
        if (guardado) {
          const platoData = platoDoc.data() as { nombre: string, imagen: string, precio: number };
          const cantidad = guardado.cantidad;
          const subtotal = cantidad * platoData.precio;

          platos.push({
            id,
            nombre: platoData.nombre,
            imagen: platoData.imagen,
            cantidad,
            precio: platoData.precio,
            subtotal
          });

          total += subtotal;
        }
      }
    }

    const pedidoRef = doc(this.firestore, `pedidos/${pedidoId}`);
    await setDoc(pedidoRef, {
      platos,
      total,
      metodoPago,
      actualizado: new Date().toISOString(),
      estado: 'confirmado'
    }, { merge: true });
  }

  async borrarPedido(pedidoId: string): Promise<void> {
    const pedidoRef = doc(this.firestore, `pedidos/${pedidoId}`);
    await deleteDoc(pedidoRef);
  }

/*async borrarPedidosPasados(userEmail: string) {
  const hoy = new Date();
  const pedidosRef = collection(this.firestore, 'pedidos');
  const q = query(pedidosRef, where('cliente.email', '==', userEmail));
  const snapshot = await getDocs(q);

  snapshot.forEach(async (pedidoDoc) => {
    const pedido = pedidoDoc.data();
    if (
  pedido['cliente']?.['fechaRecogida'] &&
  new Date(pedido['cliente']['fechaRecogida']) < hoy
) {
  await deleteDoc(doc(this.firestore, 'pedidos', pedidoDoc.id));
}
  });
}*/

  getPedidosByEmail(email: string): Observable<any[]> {
    const pedidosRef = collection(this.firestore, 'pedidos');
    const q = query(pedidosRef, where('cliente.email', '==', email));
    return collectionData(q, { idField: 'id' });
  }

  getReservasByEmail(email: string): Observable<any[]> {
    const reservasRef = collection(this.firestore, 'reservas');
    const q = query(reservasRef, where('email', '==', email));
    return collectionData(q, { idField: 'id' });
  }

  async cancelarReserva(reservaId: string): Promise<void> {
    const reservaRef = doc(this.firestore, `reservas/${reservaId}`);
    await deleteDoc(reservaRef);
  }

  async cancelarPedido(pedidoId: string): Promise<void> {
    const pedidoRef = doc(this.firestore, `pedidos/${pedidoId}`);
    await deleteDoc(pedidoRef);
  }

/*async borrarReservasPasadas(email: string) {
  const reservasRef = collection(this.firestore, 'reservas');
  const snapshot = await getDocs(reservasRef);
  const ahora = new Date();

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as any;
    if (data.email === email && data.fecha && data.hora) {
      const fechaHora = new Date(`${data.fecha}T${data.hora}`);
      if (fechaHora < ahora) {
        await deleteDoc(doc(this.firestore, 'reservas', docSnap.id));
      }
    }
  }
}*/
}