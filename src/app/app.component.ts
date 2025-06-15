import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from './servicios/auth.service';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean = false;
  userName: string | undefined = '';
  title = 'lessenza_pruebas';

  get isInicio(): boolean {
    return this.router.url === '/inicio' || this.router.url === '/';
  }

  // Loader pizza
  isLoading: boolean = false;

  // Para sticky y animación del título
  stickyTitle = false;
  titleTop = 50;
  titleFontSize = 4;

  // Para scroll automático por inactividad
  private inactivityTimeout: any;
  private animatingScroll = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    private ngZone: NgZone
  ) {
    // Loader pizza entre rutas
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.authService.authState$.subscribe((user: User | null) => {
      if (user) {
        this.isAuthenticated = true;
        this.userName = user.displayName || user.email || 'Usuario';
      } else {
        this.isAuthenticated = false;
        this.userName = '';
      }
    });
    this.resetInactivityTimer();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Escucha actividad del usuario y reinicia el temporizador de inactividad
  @HostListener('window:scroll', [])
  @HostListener('window:mousemove', [])
  @HostListener('window:touchstart', [])
  onUserActivity() {
    this.resetInactivityTimer();
    // Si quieres que el título reaccione al scroll, llama aquí también a onWindowScroll()
    if (event && event.type === 'scroll') {
      this.onWindowScroll();
    }
  }

  resetInactivityTimer() {
    if (this.animatingScroll) return;
    clearTimeout(this.inactivityTimeout);
    this.setupInactivityScroll();
  }

  setupInactivityScroll() {
    this.inactivityTimeout = setTimeout(() => {
      if (window.scrollY < 10 && (this.router.url === '/inicio' || this.router.url === '/')) {
        this.animatingScroll = true;
        const amount = 130;    // píxeles a bajar
        const duration = 600;  // duración más larga para suavidad

        // Easing muy suave tipo easeInOutQuart
        const ease = (t: number) =>
          t < 0.5
            ? 8 * t * t * t * t
            : 1 - Math.pow(-2 * t + 2, 4) / 2;

        const smoothScroll = (from: number, to: number, duration: number, callback: () => void) => {
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = ease(progress);
            window.scrollTo(0, from + (to - from) * eased);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              callback();
            }
          };
          requestAnimationFrame(animate);
        };

        // Solo una bajada y subida, muy suave y natural
        smoothScroll(0, amount, duration, () => {
          setTimeout(() => {
            smoothScroll(amount, 0, duration, () => {
              this.animatingScroll = false;
            });
          }, 100); // pequeña pausa en el punto más bajo
        });
      }
    }, 4000); // 4 segundos de inactividad
  }

  onWindowScroll() {
    const videoHeight = window.innerHeight;
    const scrollY = window.scrollY;
    const percent = Math.min(scrollY / videoHeight, 1);

    this.titleTop = 50 - percent * 40; // de 50vh a 10vh
    this.titleFontSize = 4 - percent * 2; // de 4vw a 2vw
    this.stickyTitle = percent === 1;
    // No reiniciamos aquí el timer, ya lo hace onUserActivity
  }

  getScrollTop(): number {
    return this.titleTop;
  }
  getScrollFontSize(): string {
    return this.titleFontSize + 'vw';
  }
}