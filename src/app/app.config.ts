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

    // Initialise le service de navigation dès le démarrage de l'application
    provideAppInitializer(() => { inject(NavigationService) }),

    // Configuration du thème UI PrimeNG
    providePrimeNG({
        theme: {
            preset: Lara,
        }
    }),

    // Définit le français comme langue par défaut pour la mise en forme (dates, monnaies)
    { provide: LOCALE_ID, useValue: 'fr-FR'}
  ]
};
