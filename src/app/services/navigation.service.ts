import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  // Stocke l'URL de la page juste avant le déplacement actuel
  private previousUrl: string | null = null;

  // Stocke l'URL de la page sur laquelle l'utilisateur se trouve actuellement
  private currentUrl: string | null = null;

  /**
   * SÉCURITÉ : Liste blanche des routes "piliers" de l'application.
   * Ce sont les seules pages de niveau supérieur (Hubs) vers lesquelles le bouton retour
   * du site a le droit de renvoyer physiquement l'utilisateur.
   */
  private authorizedRoutes = ['/', '/sorties', '/prochainement', '/en-salle'];

  constructor(private router: Router) {
    // On écoute en continu tous les événements émis par le routeur d'Angular
    this.router.events
      .pipe(
        // On filtre pour ne garder UNIQUELEMENT le signal "NavigationEnd" 
        // (qui indique que le changement de page est terminé avec succès)
        filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // 1. L'ancienne page courante devient officiellement la page précédente
        this.previousUrl = this.currentUrl;

        // 2. On enregistre la nouvelle page courante.
        // `.split('?')[0]` permet de nettoyer l'URL en coupant tout ce qui se trouve après un "?"
        // pour ignorer les paramètres de recherche (ex: '/sorties?page=2' devient juste '/sorties')
        this.currentUrl = event.urlAfterRedirects.split('?')[0]; // On ignore les query params si besoin
      });
  }

  /**
   * Calcule et retourne une URL de retour sécurisée et cohérente pour l'expérience utilisateur.
   * Évite de renvoyer l'utilisateur en boucle sur des pages de détails imbriquées.
   * * @returns {string} L'URL de redirection finale (soit la page précédente valide, soit l'accueil)
   */
  getValidPreviousUrl(): string {
    // RÈGLE 1 : Si on possède un historique ET que la page précédente fait partie 
    // de la liste blanche des routes autorisées, on valide le retour vers celle-ci.
    if (this.previousUrl && this.authorizedRoutes.includes(this.previousUrl)) {
      return this.previousUrl;
    }

    // RÈGLE 2 (Sécurité) : Si l'utilisateur vient d'une autre page détail (ex: /movie/123 -> /movie/456),
    // d'une page non répertoriée, ou s'il a atterri directement sur le site via un lien externe (pas d'historique) :
    // On force un retour propre et sécurisé vers la page d'accueil.
    return '/';
  }
}