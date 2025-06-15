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
      observaciones: ['']
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

  onBtnLeave() {
    this.carritoAnim = 'reverse';
    this.pizzaAnim = 'rise';
  }

  hacerPedido(): void {
    if (this.pedidoForm.valid) {
      this.isLoading = true;
      const datosCliente: DatosCliente = this.pedidoForm.getRawValue();

      this.pedirService.setCliente(datosCliente);

      this.firestoreService.crearPedidoCliente(datosCliente).then(id => {
        this.pedirService.setPedidoId(id);
        this.snackBar.open('Datos ingresados correctamente. Redirigiendo...', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/pedir/mipedido']);
      }).catch(() => {
        this.isLoading = false;
        this.snackBar.open('Error al guardar datos. Intenta nuevamente.', 'Cerrar', { duration: 3000 });
      });
    } else {
      this.snackBar.open('Por favor, rellena todos los campos obligatorios.', 'Cerrar', { duration: 3000 });
    }
  }
}