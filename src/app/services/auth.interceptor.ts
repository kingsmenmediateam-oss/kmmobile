import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const auth = inject(AuthService);

  // Ne jamais ajouter Bearer sur endpoint de login
  const isLoginCall = /\/login(?:\.php)?(?:\?|$)/.test(req.url);

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      const requestToSend =
        token && !isLoginCall
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;

      return next(requestToSend);
    })
  );
};
