import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Preferences } from '@capacitor/preferences';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  personCircleOutline,
  logInOutline,
  logOutOutline,
  qrCodeOutline,
  chatbubblesOutline,
  calendarOutline,
  ribbonOutline,
} from 'ionicons/icons';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonLabel, 
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonMenuToggle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonSelect,
    IonSelectOption,
    RouterLink,
    NgFor,
    NgIf,
    AsyncPipe,
  ],
})
export class AppComponent {
  // Observable utilisé dans le menu
  isAuthenticated$ = this.auth.isAuthenticated$;
  selectedLanguage: LanguageCode = 'en';

  readonly languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  private readonly translations: Record<LanguageCode, Record<string, string>> = {
    en: {
      home: 'Home',
      account: 'My account',
      login: 'Log in',
      logout: 'Log out',
      vcard: 'vCard',
      chat: 'Chat',
      myEvents: 'My Events',
      calendar: 'Calendar',
      language: 'Language',
      default: 'Default',
    },
    nl: {
      home: 'Start',
      account: 'Mijn account',
      login: 'Inloggen',
      logout: 'Uitloggen',
      vcard: 'vCard',
      chat: 'Chat',
      myEvents: 'Mijn evenementen',
      calendar: 'Kalender',
      language: 'Taal',
      default: 'Standaard',
    },
    fr: {
      home: 'Accueil',
      account: 'Mon compte',
      login: 'Se connecter',
      logout: 'Se déconnecter',
      vcard: 'vCard',
      chat: 'Chat',
      myEvents: 'Mes événements',
      calendar: 'Calendrier',
      language: 'Langue',
      default: 'Par défaut',
    },
    de: {
      home: 'Startseite',
      account: 'Mein Konto',
      login: 'Anmelden',
      logout: 'Abmelden',
      vcard: 'vCard',
      chat: 'Chat',
      myEvents: 'Meine Events',
      calendar: 'Kalender',
      language: 'Sprache',
      default: 'Standard',
    },
    pl: {
      home: 'Strona glowna',
      account: 'Moje konto',
      login: 'Zaloguj sie',
      logout: 'Wyloguj sie',
      vcard: 'vCard',
      chat: 'Czat',
      myEvents: 'Moje wydarzenia',
      calendar: 'Kalendarz',
      language: 'Jezyk',
      default: 'Domyslny',
    },
    lt: {
      home: 'Pagrindinis',
      account: 'Mano paskyra',
      login: 'Prisijungti',
      logout: 'Atsijungti',
      vcard: 'vCard',
      chat: 'Pokalbiai',
      myEvents: 'Mano renginiai',
      calendar: 'Kalendorius',
      language: 'Kalba',
      default: 'Numatytoji',
    },
    es: {
      home: 'Inicio',
      account: 'Mi cuenta',
      login: 'Iniciar sesion',
      logout: 'Cerrar sesion',
      vcard: 'vCard',
      chat: 'Chat',
      myEvents: 'Mis eventos',
      calendar: 'Calendario',
      language: 'Idioma',
      default: 'Predeterminado',
    },
  };

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    addIcons({
      homeOutline,
      personCircleOutline,
      logInOutline,
      logOutOutline,
      qrCodeOutline,
      chatbubblesOutline,
      calendarOutline,
      ribbonOutline,
    });
    void this.initLanguage();
  }

  tr(key: string): string {
    return this.translations[this.selectedLanguage][key] ?? this.translations.en[key] ?? key;
  }

  async setLanguage(code: LanguageCode): Promise<void> {
    this.selectedLanguage = code;
    document.documentElement.lang = code;
    await Preferences.set({ key: 'app_language', value: code });
  }

  private async initLanguage(): Promise<void> {
    const { value } = await Preferences.get({ key: 'app_language' });
    const candidate = (value ?? 'en') as LanguageCode;
    const supported = this.languages.some((lang) => lang.code === candidate);
    this.selectedLanguage = supported ? candidate : 'en';
    document.documentElement.lang = this.selectedLanguage;
  }

  /**
   * Appelé depuis le menu
   */
  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}

type LanguageCode = 'en' | 'nl' | 'fr' | 'de' | 'pl' | 'lt' | 'es';
