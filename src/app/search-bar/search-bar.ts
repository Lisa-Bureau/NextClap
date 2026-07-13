import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Movie } from '../models/movie';
import { MoviesService } from '../services/movies.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar implements OnInit {

  // --- ÉTAT DU COMPOSANT (PROPRIÉTÉS) ---
  searchIsOpen: boolean = false;    // Gère l'état d'ouverture global de l'interface de recherche
  allMovies: Movie[] = [];          // Base de données locale de tous les films récupérés du service
  filteredMovies: Movie[] = [];     // Liste des films qui correspondent à la recherche en cours
  searchQuery: string = "";         // Le texte actuellement saisi par l'utilisateur
  isDropdownOpen: boolean = false;  // Gère l'affichage de la liste déroulante des résultats

  // --- ACCÈS AUX ÉLÉMENTS DU DOM (TEMPLATE) ---
  // @ViewChild permet de récupérer une référence directe vers un élément HTML du template (via sa variable locale #nom)
  @ViewChild("searchModal") searchModal!: ElementRef<HTMLDialogElement>;  // Référence vers la balise HTML5 <dialog>
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;   // Référence vers le champ de saisie <input>

  // Injection des dépendances nécessaires : le service de données et le routeur d'Angular
  constructor(private moviesService: MoviesService,
              private router: Router) {};

  /**
   * Alterne l'ouverture et la fermeture de la modal de recherche.
   * @param inputElement L'élément HTML input passé en paramètre depuis le template
   */
  toggleSearch(inputElement: HTMLInputElement): void {
    this.searchIsOpen = !this.searchIsOpen;
    const dialog = this.searchModal.nativeElement;  // Extraction de l'élément HTML natif <dialog>

    if (this.searchIsOpen) {
      dialog.showModal();     // Utilise l'API native du navigateur pour afficher la modal au premier plan
      inputElement.focus();   // Force le focus du curseur sur l'input dès l'ouverture
    } else {
      // Réinitialisation complète de l'état à la fermeture
      inputElement.value = "";
      dialog.close();   // Ferme proprement la modal native
      this.isDropdownOpen = false;
      this.searchQuery = '';
    }
  }

  /**
   * Cycle de vie Angular exécuté une seule fois à l'initialisation du composant.
   * Idéal pour charger les données initiales.
   */
  ngOnInit(): void {
    // On s'abonne à l'Observable du service pour récupérer et stocker la liste des films présentés sur le site
    this.moviesService.getAvailableMovies().subscribe(movies => {
      this.allMovies = movies;
    });

    // Déclenche l'initialisation du catalogue global
    this.moviesService.initGlobalCatalog();
  }

  /**
   * Méthode appelée à chaque frappe de clavier dans le champ de recherche.
   * @param query La chaîne de caractères saisie par l'utilisateur
   */
  onSearchChange(query: string): void {
    this.searchQuery = query.trim();      // Nettoie les espaces inutiles au début et à la fin

    // RÈGLE : Si l'utilisateur saisit moins de 2 caractères, on vide les résultats et on ferme le dropdown
    if (this.searchQuery.length < 2) {
      this.filteredMovies = [];
      this.isDropdownOpen = false;
      return;   // On stoppe l'exécution ici
    }

    // Filtrage des films : on compare les titres en minuscules pour ignorer la casse (Case Insensitive)
    this.filteredMovies = this.allMovies.filter(movie =>
      movie.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // On affiche le dropdown des résultats (même si la liste filtrée est vide, pour afficher un message "aucun résultat")
    this.isDropdownOpen = true;
  }

  /**
   * Redirige l'utilisateur vers la page détail du film sélectionné.
   * @param movieId L'identifiant unique du film
   */
  goToDetail(movieId: number): void {
    // Réinitialisation de l'affichage avant de partir pour éviter les effets de bord visuels au retour
    this.searchIsOpen = false;
    this.isDropdownOpen = false;
    this.searchQuery = '';

    // Fermeture de la modal native si elle existe
    if (this.searchModal) {
      this.searchModal.nativeElement.close();
    }

    // Nettoyage de la valeur textuelle de l'input dans le DOM
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }

    // Navigation d'Angular vers la route dynamique du film (ex: /movie/42)
    this.router.navigate(['/movie', movieId]); // Redirection vers ta page détail
  }

  /**
   * Écouteur global sur le document. Se déclenche à CHAQUE clic n'importe où sur l'écran.
   * Sert principalement à fermer les résultats si on clique en dehors de la zone de recherche.
   */
  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    // Sécurité : Si la modal n'est pas encore rendue/disponible dans le DOM, on ne fait rien
    if (!this.searchModal) return;

    // Analyse géométrique : On vérifie si l'élément cliqué (event.target) se trouve à l'intérieur de notre modal
    const clickedInside = this.searchModal.nativeElement.contains(event.target as Node);

    // Si le clic a eu lieu en dehors de la zone de recherche
    if (!clickedInside) {
      this.isDropdownOpen = false;   // Ferme la liste des résultats
      this.filteredMovies = [];      // Nettoie les suggestions
      this.searchQuery = "";         // Réinitialise la chaîne de recherche

      // Vide visuellement le champ de texte
      if (this.searchInput) {
        this.searchInput.nativeElement.value = "";
      }
    }
  }
}
