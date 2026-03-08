import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  sendingEmergency = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  async onNeedHelp(): Promise<void> {
    if (this.sendingEmergency) return;

    this.sendingEmergency = true;
    try {
      const headers = await this.buildAuthHeaders();
      const response = await firstValueFrom(
        this.http.post<{
          ok: boolean;
          roomId: number;
          messageId: number;
          text: string;
          displayName: string;
          createdAt: string;
        }>(`${environment.apiUrl}/emergency_help.php`, {}, { headers })
      );
      console.log('Emergency alert sent:', response);
      await this.joinEmergencyRoomAndNavigate();
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    } finally {
      this.sendingEmergency = false;
    }
  }

  private async joinEmergencyRoomAndNavigate(): Promise<void> {
    try {
      const headers = await this.buildAuthHeaders();
      const result = await firstValueFrom(
        this.http.post<{ ok: boolean; roomId: number }>(
          `${environment.apiUrl}/emergency_join.php`,
          {},
          { headers }
        )
      );
      await this.router.navigate(['/chat'], {
        queryParams: { roomId: result.roomId },
      });
    } catch (error) {
      console.error('Failed to join emergency room:', error);
    }
  }

  private async buildAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.auth.getToken();
    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
