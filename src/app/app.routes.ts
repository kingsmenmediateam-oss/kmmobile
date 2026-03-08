import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },

  // vCard (publique : affiche QR bidon si pas connecté)
  {
    path: 'vcard',
    loadComponent: () =>
      import('./pages/vcard/vcard.page').then(m => m.VCardPage),
  },

  // Profil (protégée)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
{
  path: 'chat',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/chat/chat.page').then(m => m.ChatPage),
},

// My Events (protected)
{
  path: 'my-event',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/my-event/my-event.page').then(m => m.MyEventPage),
},

// Calendrier Kingsmen (protégée)
{
  path: 'calendar',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./pages/calendar/calendar.page').then(m => m.CalendarPage),
},


  // Wildcard TOUJOURS en dernier
  {
    path: '**',
    redirectTo: 'home', 
  }
];
