import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { homeOutline, personCircleOutline,  
  logInOutline ,logOutOutline,
  qrCodeOutline, chatbubblesOutline,
sendOutline } from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';

// ✅ Enregistrement explicite des icônes utilisées dans le menu
addIcons({
  'home-outline': homeOutline,
  'person-circle-outline': personCircleOutline,
  'log-out-outline': logOutOutline,
  'log-in-outline': logInOutline,
  'qr-code-outline': qrCodeOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'send-outline': sendOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
});
