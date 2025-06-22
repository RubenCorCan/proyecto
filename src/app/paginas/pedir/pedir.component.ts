import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatosCliente, PedirService } from '../../servicios/pedir.service';
import { AuthService } from '../../servicios/auth.service';
import { FirestoreService } from '../../servicios/firestore.service';

@Component({
  selector: 'app-pedir',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './pedir.component.html',
  styleUrl: './pedir.component.css',
})
export class PedirComponent implements OnInit {
  pedidoForm!: FormGroup;
  horariosDisponibles: string[] = [
    '12:00', '12:30', '13:00', '13:30', '14:00',
    '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  carritoAnim = '';
  pizzaAnim = '';
  isLoading: boolean = false;
  usuario: any = null;

  // --- Calendario personalizado para pedidos ---
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  hoy = new Date();
  anioActualPedido = this.hoy.getFullYear();
  mesActualPedido = this.hoy.getMonth();
  fechaSeleccionadaPedido: Date | null = null;

  horasRecogida: string[] = [
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '19:00', '19:15', '19:30', '19:45',
  '20:00', '20:15', '20:30', '20:45',
  '21:00', '21:15', '21:30', '21:45'
];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private pedirService: PedirService,
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {}

  ngOnInit(): void {
    this.pedidoForm = this.fb.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      fechaRecogida: ['', Validators.required],
      horaRecogida: ['', Validators.required],
    });

    // Si ya hay cliente guardado, redirige automáticamente
    const cliente = this.pedirService.getCliente();
    if (cliente) {
      this.router.navigate(['/pedir/mipedido']);
      return;
    }

    this.authService.authState$.subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.pedidoForm.patchValue({
          nombre: usuario.nombre || '',
          telefono: usuario.telefono || '',
          email: usuario.email || ''
        });

        this.pedidoForm.get('nombre')?.disable();
        this.pedidoForm.get('telefono')?.disable();
        this.pedidoForm.get('email')?.disable();
      }
    });
  }

  getHorasDisponibles(): string[] {
  const fechaForm = this.pedidoForm.get('fechaRecogida')?.value;
  if (!fechaForm) return this.horasRecogida;
  const hoy = new Date();
  const fechaSeleccionada = new Date(fechaForm);

  // Si el día seleccionado es hoy, filtra las horas pasadas
  if (
    fechaSeleccionada.getFullYear() === hoy.getFullYear() &&
    fechaSeleccionada.getMonth() === hoy.getMonth() &&
    fechaSeleccionada.getDate() === hoy.getDate()
  ) {
    const ahora = hoy.getHours() * 60 + hoy.getMinutes();
    return this.horasRecogida.filter(hora => {
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m > ahora;
    });
  }
  // Si es otro día, muestra todas las horas
  return this.horasRecogida;
}

  // --- Lógica del calendario personalizado para pedidos ---
  getCalendarDaysPedido(): (number | null)[] {
    const primerDia = new Date(this.anioActualPedido, this.mesActualPedido, 1).getDay() || 7;
    const diasEnMes = new Date(this.anioActualPedido, this.mesActualPedido + 1, 0).getDate();
    const dias: (number | null)[] = [];
    for (let i = 1; i < primerDia; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(d);
    while (dias.length < 42) dias.push(null);
    return dias;
  }

  prevMonthPedido() {
    if (this.mesActualPedido === this.hoy.getMonth() && this.anioActualPedido === this.hoy.getFullYear()) return;
    if (this.mesActualPedido === 0) {
      this.mesActualPedido = 11;
      this.anioActualPedido--;
    } else {
      this.mesActualPedido--;
    }
  }

  nextMonthPedido() {
    if (this.mesActualPedido === 11) {
      this.mesActualPedido = 0;
      this.anioActualPedido++;
    } else {
      this.mesActualPedido++;
    }
  }

  selectDatePedido(d: number | null) {
  if (!d || this.isPastDayPedido(d)) return;
  this.fechaSeleccionadaPedido = new Date(this.anioActualPedido, this.mesActualPedido, d);
  const yyyy = this.fechaSeleccionadaPedido.getFullYear();
  const mm = (this.fechaSeleccionadaPedido.getMonth() + 1).toString().padStart(2, '0');
  const dd = this.fechaSeleccionadaPedido.getDate().toString().padStart(2, '0');
  const fechaLocal = `${yyyy}-${mm}-${dd}`;
  this.pedidoForm.get('fechaRecogida')?.setValue(fechaLocal);
  this.pedidoForm.get('fechaRecogida')?.markAsTouched();
}

  isTodayPedido(d: number | null): boolean {
    if (!d) return false;
    const hoy = this.hoy;
    return (
      d === hoy.getDate() &&
      this.mesActualPedido === hoy.getMonth() &&
      this.anioActualPedido === hoy.getFullYear()
    );
  }

  isSelectedPedido(d: number | null): boolean {
    if (!d || !this.fechaSeleccionadaPedido) return false;
    return (
      d === this.fechaSeleccionadaPedido.getDate() &&
      this.mesActualPedido === this.fechaSeleccionadaPedido.getMonth() &&
      this.anioActualPedido === this.fechaSeleccionadaPedido.getFullYear()
    );
  }

  isPastDayPedido(d: number | null): boolean {
    if (!d) return true;
    if (this.anioActualPedido === this.hoy.getFullYear() && this.mesActualPedido === this.hoy.getMonth()) {
      return d < this.hoy.getDate();
    }
    if (
      this.anioActualPedido < this.hoy.getFullYear() ||
      (this.anioActualPedido === this.hoy.getFullYear() && this.mesActualPedido < this.hoy.getMonth())
    ) {
      return true;
    }
    return false;
  }
  // --- Fin lógica calendario personalizado ---

  onBtnLeave() {
    this.carritoAnim = 'reverse';
    this.pizzaAnim = 'rise';
  }

  onTelefonoInput(event: any) {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 9) value = value.slice(0, 9);
  this.pedidoForm.get('telefono')?.setValue(value, { emitEvent: false });
}

  hacerPedido(): void {
  if (this.pedidoForm.valid) {
    this.isLoading = true;
    const datosCliente: DatosCliente = this.pedidoForm.getRawValue();
    this.pedirService.setCliente(datosCliente);

    this.firestoreService.crearPedidoCliente(datosCliente).then(async id => {
      this.pedirService.setPedidoId(id);
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/pedir/mipedido']);
      }, 1000);
    }).catch(() => {
      this.isLoading = false;
      this.snackBar.open('Error al guardar datos. Intenta nuevamente.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error']});
    });
  } else {
    this.snackBar.open('Por favor, rellena todos los campos obligatorios.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
  }
}
}