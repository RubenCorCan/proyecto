import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FirestoreService } from '../../servicios/firestore.service';
import { ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None, 
  selector: 'app-reserva',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit, AfterViewInit {
  reservaForm: FormGroup;
  loading = false;

  aforo: any = null;
  usuario: any = null;

  readonly turnos = [
    { nombre: 'Mañana', inicio: '12:00', fin: '16:00' },
    { nombre: 'Noche', inicio: '20:00', fin: '00:00' }
  ];

  horariosManana = this.generarHorarios('12:00', '16:00');
  horariosNoche = this.generarHorarios('20:00', '00:00');
  get horariosDisponibles() {
    return ['13:00', '15:00', '20:00', '22:00'];
  }

  // --- CALENDARIO PERSONALIZADO ---
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  hoy = new Date();
  anioActual = this.hoy.getFullYear();
  mesActual = this.hoy.getMonth();
  fechaSeleccionada: Date | null = null;
  focusedDay: number | null = null;
  @ViewChildren('calendarDayBtn') calendarDayBtns!: QueryList<ElementRef<HTMLButtonElement>>;



  getCalendarDays(): (number | null)[] {
    const primerDia = new Date(this.anioActual, this.mesActual, 1).getDay() || 7;
    const diasEnMes = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    const dias: (number | null)[] = [];
    for (let i = 1; i < primerDia; i++) dias.push(null);
    for (let d = 1; d <= diasEnMes; d++) dias.push(d);
    while (dias.length < 42) dias.push(null); // Siempre 6 filas
    return dias;
  }

  prevMonth() {
    // Solo permite retroceder si no es el mes actual
    if (this.mesActual === this.hoy.getMonth() && this.anioActual === this.hoy.getFullYear()) return;
    if (this.mesActual === 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else {
      this.mesActual--;
    }
    this.setInitialFocus();
  }

  nextMonth() {
    if (this.mesActual === 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
    this.setInitialFocus();
  }

  selectDate(d: number | null) {
  if (!d || this.isPastDay(d)) return;
  this.fechaSeleccionada = new Date(this.anioActual, this.mesActual, d);
  // Guarda la fecha como string local, no UTC
  const yyyy = this.fechaSeleccionada.getFullYear();
  const mm = (this.fechaSeleccionada.getMonth() + 1).toString().padStart(2, '0');
  const dd = this.fechaSeleccionada.getDate().toString().padStart(2, '0');
  const fechaLocal = `${yyyy}-${mm}-${dd}`;
  this.reservaForm.get('fecha')?.setValue(fechaLocal);
}

  isToday(d: number | null): boolean {
    if (!d) return false;
    const hoy = this.hoy;
    return (
      d === hoy.getDate() &&
      this.mesActual === hoy.getMonth() &&
      this.anioActual === hoy.getFullYear()
    );
  }

  isSelected(d: number | null): boolean {
    if (!d || !this.fechaSeleccionada) return false;
    return (
      d === this.fechaSeleccionada.getDate() &&
      this.mesActual === this.fechaSeleccionada.getMonth() &&
      this.anioActual === this.fechaSeleccionada.getFullYear()
    );
  }

  isPastDay(d: number | null): boolean {
    if (!d) return true;
    // Si es el mes y año actual, deshabilita días antes de hoy
    if (this.anioActual === this.hoy.getFullYear() && this.mesActual === this.hoy.getMonth()) {
      return d < this.hoy.getDate();
    }
    // Si es un mes anterior, deshabilita todo
    if (
      this.anioActual < this.hoy.getFullYear() ||
      (this.anioActual === this.hoy.getFullYear() && this.mesActual < this.hoy.getMonth())
    ) {
      return true;
    }
    return false;
  }

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.reservaForm = this.fb.group({
  nombre: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  telefono: [
    '',
    [
      Validators.required,
      Validators.pattern(/^[0-9]{9}$/) 
    ]
  ],
  fecha: ['', Validators.required],
  hora: ['', Validators.required],
  personas: [
    '',
    [
      Validators.required,
      Validators.pattern(/^[1-9][0-9]*$/)
    ]
  ]
});

    this.authService.authState$.subscribe(user => {
      this.usuario = user;
      if (user) {
        this.reservaForm.patchValue({
          nombre: user.nombre || '',
          email: user.email || '',
          telefono: user.telefono || ''
        });

        this.reservaForm.get('nombre')?.disable();
        this.reservaForm.get('email')?.disable();
        this.reservaForm.get('telefono')?.disable();
      }
    });
  }

  async ngOnInit() {
    this.aforo = await this.firestoreService.getAforo();
  }

  ngAfterViewInit() {
    this.setInitialFocus();
  }

  async reservar() {
  console.log('Intentando reservar...');
  if (this.reservaForm.valid) {
    this.loading = true;
    // Usa getRawValue para obtener también los campos deshabilitados
    let formValue = this.reservaForm.getRawValue();
    // Si hay usuario logueado, sobreescribe los datos personales con los de la cuenta
    if (this.usuario) {
      formValue = {
        ...formValue,
        nombre: this.usuario.nombre || '',
        email: this.usuario.email || '',
        telefono: this.usuario.telefono || ''
      };
    }
    const fechaISO = formValue.fecha instanceof Date ? formValue.fecha.toISOString().substring(0, 10) : formValue.fecha;
    const hora = formValue.hora;
    const personas = Number(formValue.personas);
    const reservaBase = { ...formValue, fecha: fechaISO };
    try {
      const turno = this.turnos.find(t => this.estaEnTurno(hora, t.inicio, t.fin));
      if (!turno) {
        this.snackBar.open('La hora seleccionada no está dentro del horario de apertura.', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
        return;
      }
      const reservasMismaFechaHora = await this.firestoreService.getReservasPorFechaHora(fechaISO, hora);
      const comensalesActuales = reservasMismaFechaHora.reduce((acc: number, r: any) => acc + Number(r.personas), 0);
      if (comensalesActuales + personas > this.aforo.maxComensales) {
        this.snackBar.open('No hay espacio suficiente para comensales en esa hora.', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
        return;
      }
      const mesasOcupadas = reservasMismaFechaHora.map((r: any) => r.mesa);
      const mesasDisponibles = (this.aforo.mesas || []).filter((m: number) => !mesasOcupadas.includes(m));
      if (mesasDisponibles.length === 0) {
        this.snackBar.open('No quedan mesas disponibles para esa hora.', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
        this.loading = false;
        return;
      }
      const mesaAsignada = mesasDisponibles[Math.floor(Math.random() * mesasDisponibles.length)];
      const reserva = { ...reservaBase, mesa: mesaAsignada };
      await this.firestoreService.guardarReserva(reserva);
      this.snackBar.open(`¡Reserva guardada con éxito! Mesa asignada: ${mesaAsignada}`, 'Cerrar', { duration: 7000, panelClass: ['snackbar-success'] });
      this.reservaForm.reset();
      this.fechaSeleccionada = null; 
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      this.snackBar.open('Error al guardar la reserva.', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
    }
    this.loading = false;
  } else {
    console.warn('Formulario no válido:', this.reservaForm.value);
  }
}

  estaEnTurno(hora: string, inicio: string, fin: string): boolean {
    const [h, m] = hora.split(':').map(Number);
    const [hi, mi] = inicio.split(':').map(Number);
    let [hf, mf] = fin.split(':').map(Number);
    if (fin === '00:00') { hf = 24; }
    const minutos = h * 60 + m;
    const minInicio = hi * 60 + mi;
    const minFin = hf * 60 + mf;
    return minutos >= minInicio && minutos < minFin;
  }

  generarHorarios(inicio: string, fin: string): string[] {
    const horarios: string[] = [];
    let [h, m] = inicio.split(':').map(Number);
    let [hf, mf] = fin.split(':').map(Number);
    if (fin === '00:00') hf = 24;
    while (h * 60 + m < hf * 60 + mf) {
      const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      horarios.push(horaStr);
      m += 15;
      if (m >= 60) { h++; m = 0; }
    }
    return horarios;
  }

  mesasDisponibles() {
    return this.aforo.mesas || [];
  }
  
  getHorasDisponiblesFiltradas(): string[] {
  if (!this.fechaSeleccionada) return this.horariosDisponibles;
  const hoy = new Date();
  const esHoy =
    this.fechaSeleccionada.getFullYear() === hoy.getFullYear() &&
    this.fechaSeleccionada.getMonth() === hoy.getMonth() &&
    this.fechaSeleccionada.getDate() === hoy.getDate();

  if (!esHoy) return this.horariosDisponibles;

  const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
  // Devuelve solo las horas posteriores a la actual
  return this.horariosDisponibles.filter(horaStr => {
    const [h, m] = horaStr.split(':').map(Number);
    const minutos = h * 60 + m;
    return minutos > horaActual;
  });
}

blockDecimal(event: KeyboardEvent) {
  if (event.key === '.' || event.key === ',' || event.key === 'e') {
    event.preventDefault();
  }
}

onTelefonoInput(event: any) {
  let value = event.target.value.replace(/\D/g, '');
  if (value.length > 9) value = value.slice(0, 9);
  this.reservaForm.get('telefono')?.setValue(value, { emitEvent: false });
}

getAriaLabel(d: number | null): string {
  if (!d) return '';
  const fecha = new Date(this.anioActual, this.mesActual, d);
  let label = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (this.isSelected(d)) label += ', seleccionado';
  if (this.isToday(d)) label += ', hoy';
  return label;
}

setInitialFocus() {
    setTimeout(() => {
      const dias = this.getCalendarDays();
      const firstAvailable = dias.find(d => !!d && !this.isPastDay(d));
      this.focusedDay = firstAvailable || null;
      this.focusCalendarDay();
    });
  }

  focusCalendarDay() {
    setTimeout(() => {
      if (!this.calendarDayBtns) return;
      const btns = this.calendarDayBtns.toArray();
      const idx = btns.findIndex((btn, i) => {
        const d = this.getCalendarDays()[i];
        return d === this.focusedDay;
      });
      if (idx >= 0 && btns[idx]) {
        btns[idx].nativeElement.focus();
      }
    });
  }

onCalendarKeydown(event: KeyboardEvent, d: number | null) {
    if (!d) return;
    const dias = this.getCalendarDays().map((day, i) => ({ day, i }))
      .filter(obj => !!obj.day && !this.isPastDay(obj.day)) as { day: number, i: number }[];
    const idx = dias.findIndex(obj => obj.day === d);

    if (event.key === 'ArrowRight') {
      if (idx < dias.length - 1) {
        this.focusedDay = dias[idx + 1].day;
        this.focusCalendarDay();
      } else {
        this.nextMonth();
        this.setInitialFocus();
      }
      event.preventDefault();
    }
    else if (event.key === 'ArrowLeft') {
      if (idx > 0) {
        this.focusedDay = dias[idx - 1].day;
        this.focusCalendarDay();
      } else {
        this.prevMonth();
        this.setInitialFocus();
      }
      event.preventDefault();
    }
    else if (event.key === 'ArrowDown' && idx + 7 < dias.length) {
      this.focusedDay = dias[idx + 7].day;
      this.focusCalendarDay();
      event.preventDefault();
    }
    else if (event.key === 'ArrowUp' && idx - 7 >= 0) {
      this.focusedDay = dias[idx - 7].day;
      this.focusCalendarDay();
      event.preventDefault();
    }
    else if (event.key === 'Enter' || event.key === ' ') {
      this.selectDate(d);
      event.preventDefault();
    }
  }
}