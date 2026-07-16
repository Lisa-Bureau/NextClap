import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MoviesService } from '../services/movies.service';

@Component({
  selector: 'app-sort-selector',
  imports: [ReactiveFormsModule],
  templateUrl: './sort-selector.html',
  styleUrl: './sort-selector.scss',
})
export class SortSelector implements OnInit, OnDestroy {

  // Stocke l'URL de la page active (ex: '/sorties')
  currentUrl!: string;

  // Contrôle l'affichage (ouverture/fermeture) du menu déroulant (dropdown) dans le HTML
  isDropdownOpen: boolean = false;

  // Configuration des options de tri disponibles pour l'utilisateur
  sortingCondition = [
    { key: "recent", label: "Dates les plus proches" },
    { key: "oldest", label: "Dates les plus éloignées" },
    { key: "popular", label: "Popularité la plus grande" }
  ];

  // Formulaire réactif (Reactive Forms) pour suivre l'état du bouton radio sélectionné
  sortControl = new FormControl('');

  constructor(private router: Router,
              private moviesService: MoviesService,
              private elementRef: ElementRef) {};

  /**
   * Alterne l'état d'ouverture du dropdown (l'ouvre s'il est fermé, le ferme s'il est ouvert).
   */
  toggleSort(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Initialisation du composant
   */
  ngOnInit(): void {
    // 1. Récupère l'URL de la page courante au chargement
    this.currentUrl = this.router.url;

    // 2. Écoute en continu les changements de valeur des boutons radio.
    // Dès que l'utilisateur sélectionne une option, sa clé (ex: 'popular') est envoyée au service de films.
    this.sortControl.valueChanges.subscribe(value => {
      if (value) {
        this.moviesService.setSort(value);
      }
    });
  }

  /**
   * Nettoyage à la destruction du composant (changement de page)
   */
  ngOnDestroy(): void {
    // Réinitialise le filtre de tri dans le service partagé (Singleton) 
    // pour éviter qu'un tri sélectionné ici ne pollue la page suivante.
    this.moviesService.setSort('');
  }

  /**
   * Écouteur global sur le document. 
   * Déclenché à chaque clic n'importe où sur l'écran.
   */
  @HostListener("document:click", ["$event"])
  clickOut(event: MouseEvent) {
    // Vérifie si l'élément cliqué (event.target) se trouve physiquement à l'intérieur de ce composant
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    // Si le clic a eu lieu à l'extérieur du composant, on ferme automatiquement le dropdown
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }
}
