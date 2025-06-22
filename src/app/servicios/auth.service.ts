import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential, authState, updatePassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { sendEmailVerification } from 'firebase/auth';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();

    try {
      const result: UserCredential = await signInWithPopup(this.auth, provider);
      const user = result.user;

      if (user) {
        await this.createUserInFirestore(user);
        this.router.navigate(['/account']);
      }
    } catch (error) {
      this.snackBar.open('Error al iniciar sesión con Google.', 'Cerrar', { duration: 5000 });
    }
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    try {
      const result: UserCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = result.user;
  
      if (user.emailVerified) {
        await this.createUserInFirestore(user);
        this.router.navigate(['/account']);
      } else {
        await this.auth.signOut();
        this.snackBar.open('Debes verificar tu correo electrónico antes de iniciar sesión.', 'Cerrar', { duration: 5000 });
      }
    } catch (error) {
      this.snackBar.open('Error al iniciar sesión con correo y contraseña.', 'Cerrar', { duration: 5000 });
    }
  }

  async registerWithEmail(
    email: string,
    password: string,
    name: string,
    telefono: string,
    direccion: string,
  ): Promise<void> {
    try {
      const result: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = result.user;

      if (user) {
        await sendEmailVerification(user);
        await this.createUserInFirestore(user, name, telefono, direccion);
        this.snackBar.open('Se ha enviado un correo de verificación. Verifica tu correo antes de iniciar sesión.', 'Cerrar', { duration: 6000 });
        await this.auth.signOut();
        this.router.navigate(['/login']);
      }
    } catch (error) {
      this.snackBar.open('Error al registrar usuario.', 'Cerrar', { duration: 5000 });
    }
  }

  async resendVerificationEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      this.snackBar.open('Correo de verificación reenviado.', 'Cerrar', { duration: 5000 });
    }
  }

  async changePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      const isGoogleProvider = user.providerData.some(provider => provider.providerId === 'google.com');
      
      if (isGoogleProvider) {
        this.snackBar.open('No puedes cambiar la contraseña si estás autenticado con Google.', 'Cerrar', { duration: 5000 });
        return;
      }

      try {
        await updatePassword(user, newPassword);
        this.snackBar.open('Contraseña actualizada correctamente.', 'Cerrar', { duration: 5000 });
      } catch (error) {
        this.snackBar.open('Error al actualizar la contraseña.', 'Cerrar', { duration: 5000 });
      }
    } else {
      this.snackBar.open('No hay un usuario autenticado.', 'Cerrar', { duration: 5000 });
    }
  }

  private async createUserInFirestore(
    user: any,
    name?: string,
    telefono?: string,
    direccion?: string,
  ): Promise<void> {
    const clienteRef = doc(this.firestore, `clientes/${user.uid}`);
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
      await setDoc(clienteRef, {
        nombre: name || user.displayName || 'Sin nombre',
        email: user.email,
        telefono: telefono || user.phoneNumber || '',
        direccion: direccion || '',
      });
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/login']);
    localStorage.removeItem('pedido'); 
  }

  get authState$(): Observable<any> {
    return authState(this.auth).pipe(
      switchMap(async (user) => {
        if (!user) return null;

        const userRef = doc(this.firestore, `clientes/${user.uid}`);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          return { uid: user.uid, email: user.email, ...userSnap.data() };
        } else {
          return {
            uid: user.uid,
            email: user.email,
            nombre: user.displayName || 'Sin nombre',
            telefono: user.phoneNumber || '',
          };
        }
      })
    );
  }
}