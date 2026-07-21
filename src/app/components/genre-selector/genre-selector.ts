import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription } from 'rxjs';
import { AsyncPipe, UpperCasePipe, NgClass } from '@angular/common';
import { Genre } from '../../models/movie-genres';
import { GenresService } from '../../services/genres.service';
import { ActivatedRoute, Router } from '@angular/router';

// On extrait la valeur "magique" dans une constante pour comprendre ce qu'elle représente
const TV_MOVIE_GENRE_ID = 10770;

@Component({
  selector: 'app-genre-selector',
  imports: [AsyncPipe, UpperCasePipe, NgClass],
  templateUrl: './genre-selector.html',
  styleUrl: './genre-selector.scss',
})
export class GenreSelector implements OnInit, OnDestroy {

  movieGenres$!: Observable<Genre[]>;
  selectedGenreId?: number;

  // Gestion du désabonnement pour éviter les fuites de mémoire
  private routeSubscription!: Subscription;

  constructor(private genresService: GenresService,
              private route: ActivatedRoute,
              private router: Router) {};

  /**
   * Met à jour l'URL avec le genre sélectionné sans recharger la page
   */
  selectGenre(genreId: number | null): void {
    const paramValue = genreId?.toString() ?? null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genre: paramValue },
      queryParamsHandling: 'merge'          // Conserve les autres paramètres d'URL s'il y en a
    });
  }

  /**
   * Réinitialise le filtre de genre dans l'URL
   */
  showAllMovies(): void {
    this.selectGenre(null);
  }

  ngOnInit(): void {

    // Récupération de la liste des genres en filtrant les téléfilms
    this.movieGenres$ = this.genresService.getAllMovieGenre().pipe(
      map(genres =>
        genres.filter(genre => genre.id !== 10770)
      )
    );

    // Écoute des changements de paramètres dans l'URL
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      const genreParam = params['genre'];
      this.genreSelected(genreParam);
    });
  }

  /**
   * Utilitaire pour convertir le paramètre d'URL en nombre
   */
  private genreSelected(genreParam: string | undefined): void {
    this.selectedGenreId = genreParam ? Number(genreParam) : undefined;
  }

  // Destruction propre de l'abonnement quand le composant est retiré de l'écran
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
