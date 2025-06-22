import { Component } from '@angular/core';
import { Firestore, collection, collectionData, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent {
  reservas$: Observable<any[]>;

  constructor(private firestore: Firestore, private snackBar: MatSnackBar) {
    const reservasRef = collection(this.firestore, 'reservas');
    this.reservas$ = collectionData(reservasRef, { idField: 'id' });
  }

  borrarReserva(id: string) {
    const reservaDoc = doc(this.firestore, `reservas/${id}`);
    this.snackBar.open('Reserva eliminada correctamente.', 'Cerrar', {
      duration: 2000,
      panelClass: ['snackbar-success']
    });
    return deleteDoc(reservaDoc);
    
  }

  getFechaFormateada(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const str = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}
}