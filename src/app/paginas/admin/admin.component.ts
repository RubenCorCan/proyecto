import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private afAuth: AngularFireAuth, private router: Router, private snackBar: MatSnackBar) {}

  login() {
  console.log('Intentando login', this.email, this.password);
  this.afAuth.signInWithEmailAndPassword(this.email, this.password)
    .then(userCredential => {
      console.log('Login correcto', userCredential);
      if (userCredential.user?.email === 'admin@lessenza.com') {
        this.router.navigate(['/panelAdmin']);
        this.snackBar.open('Acceso correcto, Redirigiendo...', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
      } else {
        this.afAuth.signOut();
        this.snackBar.open('No tienes permisos de administrador', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
      }
    })
    .catch((err) => {
      console.log('Error en login', err);
      this.snackBar.open('Usuario o contraseña incorrectos', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
    });
}
}