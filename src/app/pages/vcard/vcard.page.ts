import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import QRCode from 'qrcode';
import { AuthService, MeResponse } from '../../services/auth.service';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-vcard',
  templateUrl: './vcard.page.html',
  styleUrls: ['./vcard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonSpinner,
    IonText,
    IonButton,
  ],
})
export class VCardPage implements OnInit {
  loading = true;
  errorMessage = '';

  isLoggedIn = false;
  me: MeResponse | null = null;

  // Image du QR code (data URL)
  qrDataUrl = '';

  // Entreprise en dur
  readonly company = 'Kingsmen';

  constructor(private auth: AuthService, private app: AppComponent) {}

  tr(key: string): string {
    return this.app.tr(key);
  }

  async ngOnInit() {
    await this.loadQr();
  }

  async loadQr(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.qrDataUrl = '';
    this.me = null;

    try {
      const token = await this.auth.getToken();
      this.isLoggedIn = !!token;

      if (this.isLoggedIn) {
        // récupère les infos user
        this.me = await this.auth.me();

        const payload = this.buildPayloadFromMe(this.me);
        this.qrDataUrl = await this.generateQr(payload);
      } else {
        // Mode non connecté : QR bidon
        const payload = this.buildDummyPayload();
        this.qrDataUrl = await this.generateQr(payload);
      }
    } catch (e: any) {
      this.errorMessage = e?.error?.message || e?.message || this.tr('vcardError');
    } finally {
      this.loading = false;
    }
  }

private buildPayloadFromMe(me: MeResponse): string {
  const first = (me.firstname ?? '').trim();
  const last = (me.lastname ?? '').trim();

  // Si l'email n'est pas rempli, on retombe sur username
  const email = (me.email ?? me.username ?? '').trim();

  // vCard 3.0
  // N: Nom;Prénom;Second prénom;Titre;Suffixe
  // FN: Full Name (affichage)
  const fn = `${first} ${last}`.trim() || 'Kingsmen User';

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${this.escapeVCard(last)};${this.escapeVCard(first)};;;`,
    `FN:${this.escapeVCard(fn)}`,
    `ORG:${this.escapeVCard(this.company)}`,
    email ? `EMAIL;TYPE=INTERNET:${this.escapeVCard(email)}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}

private buildDummyPayload(): string {
  const first = 'Invité';
  const last = 'Non connecté';
  const email = 'unknown@kingsmen.local';

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${this.escapeVCard(last)};${this.escapeVCard(first)};;;`,
    `FN:${this.escapeVCard(`${first} ${last}`)}`,
    `ORG:${this.escapeVCard(this.company)}`,
    `EMAIL;TYPE=INTERNET:${this.escapeVCard(email)}`,
    'END:VCARD',
  ].join('\r\n');
}

/**
 * Échappement minimal pour vCard 3.0
 * - \  ,  ;  et retours à la ligne
 */
private escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}


  private async generateQr(text: string): Promise<string> {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      // on laisse la couleur par défaut (noir sur blanc) pour lisibilité
    });
  }
}
