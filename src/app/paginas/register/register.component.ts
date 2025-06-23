import { MatSnackBar } from '@angular/material/snack-bar';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class RegisterComponent {
  step: number = 1;
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get passwordMismatch(): boolean {
  return !!(
    this.user.password &&
    this.user.confirmPassword &&
    this.user.password !== this.user.confirmPassword
  );
}

  nextStep() {
    if (this.step === 1 && this.user.name && this.user.email) {
      this.step = 2;
    } else if (
      this.step === 2 &&
      this.user.password &&
      this.user.confirmPassword &&
      !this.passwordMismatch
    ) {
      this.step = 3;
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  onSubmit() {
    if (
      this.user.name &&
      this.user.email &&
      this.user.password &&
      this.user.confirmPassword &&
      !this.passwordMismatch
    ) {
      this.authService
        .registerWithEmail(
          this.user.email,
          this.user.password,
          this.user.name,
          this.user.telefono,
          this.user.direccion,
        )
        .then(() => {
          this.snackBar.open('Se ha enviado un correo de verificación. Revisa tu bandeja de entrada.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
          this.router.navigate(['/login']);
        })
        .catch(() => {
          this.snackBar.open('Error al registrar el usuario. Inténtalo nuevamente.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
        });
    } else {
      this.snackBar.open('Completa correctamente todos los campos del formulario.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
    }
  }
  onTelefonoInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 9) value = value.slice(0, 9);
    this.user.telefono = value;
  }
  onTelefonoKeyPress(event: KeyboardEvent) {
    const key = event.key;
    if (!/^\d$/.test(key)) {
      event.preventDefault();
      return;
    }

    if (this.user.telefono.length >= 9) {
      event.preventDefault();
    }
  }
}