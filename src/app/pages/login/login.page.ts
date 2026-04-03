import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonMenuButton,
  IonButtons
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonMenuButton,
    IonButtons,
  ],
})
export class LoginPage {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private app: AppComponent
  ) {}

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
