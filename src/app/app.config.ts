import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
import { NavigationService } from './services/navigation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppInitializer(() => { inject(NavigationService) }),
    providePrimeNG({
        theme: {
            preset: Lara,
        }
    }),
    { provide: LOCALE_ID, useValue: 'fr-FR'}
  ]
};
