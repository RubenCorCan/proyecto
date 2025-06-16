import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { sendEmailVerification } from 'firebase/auth';
import { MisPedidosComponent } from './mis-pedidos.component';
import { MisReservasComponent } from './mis-reservas.component';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MisPedidosComponent,
    MisReservasComponent,
  ]
})
export class AccountComponent implements OnInit {
  accountForm!: FormGroup;
  passwordForm!: FormGroup;
  userData: any;
  activeTab = 0;
  isAuthenticated = false;
  isEmailProvider = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private firestore: Firestore,
    private router: Router,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = !!this.auth.currentUser;

    this.accountForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
    });

    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    if (this.isAuthenticated) {
      this.loadUserData();
      this.detectEmailProvider();
    }
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private async loadUserData() {
    const user = this.auth.currentUser;
    if (!user) {
      this.snackBar.open('Usuario no autenticado.', 'Cerrar', { duration: 5000 });
      return;
    }

    try {
      const clienteRef = doc(this.firestore, `clientes/${user.uid}`);
      const clienteSnap = await getDoc(clienteRef);

      if (clienteSnap.exists()) {
        this.userData = clienteSnap.data();
        this.accountForm.patchValue(this.userData);
      } else {
        this.snackBar.open('El cliente no existe en la base de datos.', 'Cerrar', { duration: 5000 });
      }
    } catch (error) {
      this.snackBar.open('Error al cargar los datos del usuario.', 'Cerrar', { duration: 5000 });
    }
  }

  private detectEmailProvider() {
    const user = this.auth.currentUser;
    if (user) {
      const providerId = user.providerData[0]?.providerId;
      this.isEmailProvider = providerId === 'password';
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid || !this.isEmailProvider) {
      return;
    }

    const newPassword = this.passwordForm.get('password')?.value;

    try {
      await this.authService.changePassword(newPassword);
      this.passwordForm.reset();
      this.snackBar.open('Contraseña cambiada exitosamente.', 'Cerrar', { duration: 5000 });
    } catch {
      this.snackBar.open('Error al cambiar la contraseña.', 'Cerrar', { duration: 5000 });
    }
  }

  async saveChanges() {
    if (!this.accountForm.valid) return;

    const user = this.auth.currentUser;
    if (!user) return;

    try {
      const clienteRef = doc(this.firestore, `clientes/${user.uid}`);
      await updateDoc(clienteRef, this.accountForm.value);
      this.snackBar.open('Información actualizada correctamente.', 'Cerrar', { duration: 5000 });
    } catch {
      this.snackBar.open('Error al actualizar la información.', 'Cerrar', { duration: 5000 });
    }
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  authenticateAccount() {
    this.router.navigate(['/login']);
  }
}