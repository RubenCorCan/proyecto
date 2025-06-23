import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  loginWithGoogle(): void {
    this.authService.loginWithGoogle().catch(error => {
      this.snackBar.open(`Error al iniciar sesión con Google: ${error.message}`, 'Cerrar', {
        duration: 5000,
        panelClass: 'snackbar-error'
      });
    });
  }

  loginWithEmail(): void {
    if (this.email && this.password) {
      this.authService.loginWithEmail(this.email, this.password).catch(error => {
        this.snackBar.open(`Error al iniciar sesión: ${error.message}`, 'Cerrar', {
          duration: 5000,
          panelClass: 'snackbar-error'
        });
      });
    } else {
      this.snackBar.open('Por favor, ingresa tu correo y contraseña.', 'Cerrar', {
        duration: 5000,
        panelClass: 'snackbar-error'
      });
    }
  }
}