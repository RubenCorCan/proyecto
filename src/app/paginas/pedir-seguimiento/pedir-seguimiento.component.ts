import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { interval, Subscription } from 'rxjs';
import { FirestoreService } from '../../servicios/firestore.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pedir-seguimiento',
  imports: [CommonModule],
  templateUrl: './pedir-seguimiento.component.html',
  styleUrl: './pedir-seguimiento.component.css'
})
export class PedirSeguimientoComponent implements OnInit, OnDestroy {
  pedidoId: string = '';
  estado: string = '';
  tiempoTranscurrido: string = '00:00';
  platos: any[] = [];

  private startTime: number = 0;
  private cronometroSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    this.pedidoId = this.route.snapshot.paramMap.get('id') || '';
    if (this.pedidoId) {
      this.obtenerSeguimiento();
    }
  }

  ngOnDestroy() {
    if (this.cronometroSub) {
      this.cronometroSub.unsubscribe();
    }
  }

  obtenerSeguimiento() {
    const seguimientoRef = doc(this.firestore, `seguimiento/${this.pedidoId}`);
    onSnapshot(seguimientoRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        this.estado = data['estado'];
        this.startTime = data['startTime'];
        this.iniciarCronometro();
      }
    });
  }

  iniciarCronometro() {
    if (this.cronometroSub) {
      this.cronometroSub.unsubscribe();
    }

    this.cronometroSub = interval(1000).subscribe(() => {
      const now = Date.now();
      const diff = now - this.startTime;

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const min = minutes < 10 ? '0' + minutes : minutes;
      const sec = seconds < 10 ? '0' + seconds : seconds;

      this.tiempoTranscurrido = `${min}:${sec}`;
    });
  }
}
