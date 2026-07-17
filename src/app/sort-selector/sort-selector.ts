import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sort-selector',
  imports: [ReactiveFormsModule],
  templateUrl: './sort-selector.html',
  styleUrl: './sort-selector.scss',
})
export class SortSelector implements OnInit {

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
              private route: ActivatedRoute,
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
    // Récupère l'URL de la page courante au chargement
    this.currentUrl = this.router.url;

    // 1. Récupération "one-shot" de la valeur du paramètre '?sort=' dans l'URL actuelle.
    // Si le paramètre n'existe pas dans l'URL, on utilise une chaîne vide par défaut.
    const currentSort = this.route.snapshot.queryParamMap.get('sort') || '';

    // 2. Initialisation de la valeur visuelle du bouton radio avec le tri de l'URL.
    // { emitEvent: false } est CRUCIAL ici : cela empêche Angular de déclencher la fonction
    // 'valueChanges' (ci-dessous), ce qui éviterait une boucle infinie de mise à jour inutile.
    this.sortControl.setValue(currentSort, { emitEvent: false });

    // 3. Écoute active des changements de sélection de l'utilisateur sur le formulaire.
    this.sortControl.valueChanges.subscribe(value => {
      // Navigation réactive : on ré-aiguille l'application sur la même page mais avec un paramètre d'URL mis à jour
      this.router.navigate([], {
        relativeTo: this.route,                 // Reste sur le composant/chemin de la page actuelle
        queryParams: { sort: value || null },   // Met à jour '?sort=valeur'. Si 'value' est vide, 'null' retire proprement le paramètre de l'URL.
        queryParamsHandling: 'merge'            // Fusionne le tri avec les autres paramètres existants de la page (ex: ?page=2 ou ?search=...)
      });
    });
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
