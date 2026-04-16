import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonSpinner,
    IonIcon,
  ],
})
export class LoginPage {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private app: AppComponent
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  tr(key: string): string {
    return this.app.tr(key);
  }

  async login() {
    this.errorMessage = '';
    this.loading = true;

    try {
      await this.authService.login(this.username, this.password);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      this.errorMessage = err?.message || this.tr('loginError');
    } finally {
      this.loading = false;
    }
  }
}
