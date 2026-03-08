import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText,
  IonButton,
  IonMenuButton,
  IonButtons,
  IonInput
} from '@ionic/angular/standalone';

import { AuthService, MeResponse, UpdateMeRequest } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonText,
    IonButton,
    CommonModule,
    FormsModule,
    IonMenuButton,
    IonButtons,
    IonInput,
  ],
})
export class ProfilePage implements OnInit {
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  me: MeResponse | null = null;

  // champs form
  firstname = '';
  lastname = '';
  email = '';
  birthday = ''; // YYYY-MM-DD

  constructor(private auth: AuthService, private router: Router) {}

  async ngOnInit() {
    await this.loadMe();
  }

  private fillForm(me: MeResponse) {
    this.firstname = me.firstname ?? '';
    this.lastname = me.lastname ?? '';
    this.email = me.email ?? '';
    this.birthday = me.birthday ?? '';
  }

  async loadMe(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      this.me = await this.auth.me();
      this.fillForm(this.me);
    } catch (e: any) {
      this.errorMessage = e?.error?.message || e?.message || 'Impossible de charger le profil';
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    try {
      const payload: UpdateMeRequest = {
        firstname: this.firstname.trim() || null,
        lastname: this.lastname.trim() || null,
        email: this.email.trim() || null,
        birthday: this.birthday.trim() || null,
      };

      const updated = await this.auth.updateMe(payload);
      this.me = updated;
      this.fillForm(updated);
      this.successMessage = 'Profil mis à jour ✅';
    } catch (e: any) {
      this.errorMessage = e?.error?.message || e?.message || 'Échec de la mise à jour';
    } finally {
      this.saving = false;
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
