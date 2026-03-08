import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export type MeResponse = {
  uuid: string | null;
  username: string | null;
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  birthday?: string | null; // "YYYY-MM-DD"
};

export type UpdateMeRequest = {
  firstname?: string | null;
  lastname?: string | null;
  email?: string | null;
  birthday?: string | null; // YYYY-MM-DD
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'https://carecode.be/kmmobile/api';
  private readonly TOKEN_KEY = 'auth_token';

  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(false);
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  constructor(private http: HttpClient) {
    // Au démarrage, on vérifie si un token existe déjà
    this.refreshAuthState();
  }

  private async refreshAuthState(): Promise<void> {
    const token = await this.getToken();
    this._isAuthenticated$.next(!!token);
  }

  async login(username: string, password: string): Promise<void> {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);

    const response = await firstValueFrom(
      this.http.post<{ token: string }>(`${this.API_URL}/login.php`, form)
    );

    const token = this.normalizeJwtToken(response?.token ?? null);
    if (!token) {
      throw new Error('Réponse invalide du serveur');
    }

    await Preferences.set({
      key: this.TOKEN_KEY,
      value: token,
    });
    localStorage.setItem(this.TOKEN_KEY, token);

    this._isAuthenticated$.next(true);
  }

  async me(): Promise<MeResponse> {
    // L'interceptor ajoutera Authorization: Bearer <token>
    return await firstValueFrom(
      this.http.get<MeResponse>(`${this.API_URL}/me.php`)
    );
  }

  async updateMe(payload: UpdateMeRequest): Promise<MeResponse> {
    return await firstValueFrom(
      this.http.put<MeResponse>(`${this.API_URL}/put_me.php`, payload)
    );
  }

  async logout(): Promise<void> {
    await Preferences.remove({ key: this.TOKEN_KEY });
    localStorage.removeItem(this.TOKEN_KEY);
    this._isAuthenticated$.next(false);
  }

  async getToken(): Promise<string | null> {
    const pref = await Preferences.get({ key: this.TOKEN_KEY });
    const normalizedPref = this.normalizeJwtToken(pref.value ?? null);
    if (normalizedPref && !this.isJwtExpired(normalizedPref)) {
      return normalizedPref;
    }

    const storageToken = this.normalizeJwtToken(localStorage.getItem(this.TOKEN_KEY));
    if (storageToken && !this.isJwtExpired(storageToken)) {
      await Preferences.set({ key: this.TOKEN_KEY, value: storageToken });
      return storageToken;
    }

    // Token absent ou corrompu -> purge pour éviter Bearer invalide
    await Preferences.remove({ key: this.TOKEN_KEY });
    localStorage.removeItem(this.TOKEN_KEY);
    return null;
  }

  private normalizeJwtToken(token: string | null): string | null {
    if (!token) return null;
    const value = token.trim();
    const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
    return jwtPattern.test(value) ? value : null;
  }

  private isJwtExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return true;

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
      const payloadJson = atob(padded);
      const payload = JSON.parse(payloadJson) as { exp?: number };

      if (typeof payload.exp !== 'number') return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
