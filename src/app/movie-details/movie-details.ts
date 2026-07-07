import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { MoviesService } from '../services/movies.service';
import { MovieDetail } from '../models/movie-details';
import { AsyncPipe, DatePipe, Location, NgStyle, UpperCasePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-details',
  imports: [AsyncPipe, DatePipe, UpperCasePipe, NgStyle],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.scss',
})
export class MovieDetails implements OnInit {

  /** Flux contenant les données brutes du film récupérées depuis l'API */
  movie$!: Observable<MovieDetail>;

  /** Flux contenant la liste des réalisateurs formatée en chaîne de caractères */
  directors$!: Observable<string | undefined>;

  /** Flux contenant les 5 premiers acteurs principaux du casting */
  casting$!: Observable<string | undefined>;

  /** Flux contenant l'URL YouTube sécurisée et encapsulée de la bande-annonce */
  trailerUrl$!: Observable<SafeResourceUrl | null>;

  /** Flux contenant la date de sortie cinéma officielle spécifiquement pour la France */
  frenchReleaseDate$! : Observable<string | null>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private moviesService: MoviesService,
              private sanitizer: DomSanitizer) {};

  /**
   * Permet de retourner à la page précédente.
   * Utilise l'historique du navigateur si disponible, sinon redirige vers l'accueil en sécurité.
   */
  goBackPage(): void {
    const currentHistory = window.history.length;

    if (currentHistory > 1) {
      this.location.back(); // Retour à la page d'origine de l'utilisateur
    } else {
      this.router.navigateByUrl("/"); // Redirection de secours vers la racine
    }
  }

  /**
   * Initialisation du composant et configuration des flux de données réactifs.
   */
  ngOnInit(): void {
    // 1. Récupération de l'identifiant du film depuis les paramètres de l'URL de la route
    const movieId = this.route.snapshot.params["id"];

    // 2. Initialisation de la source de données principale
    this.movie$ = this.moviesService.getMovieById(movieId);

    // 3. Extraction et filtrage de tous les membres de l'équipe ayant le rôle de réalisateur ("Director")
    this.directors$ = this.movie$.pipe(
      map(movie => {
        const directors = movie.credits?.crew?.filter(person => person.job === "Director");
        if (directors && directors.length > 0) {
          return directors.map(d => d.name).join(", ");
        }
        
        return 'Réalisateur inconnu';
      })
    )

    // 4. Extraction et isolation des 5 premiers acteurs principaux pour le casting
    this.casting$ = this.movie$.pipe(
      map(movie => {
        const casting = movie.credits?.cast?.slice(0, 5);
        return casting?.map(actor => actor.name).join(", ")
      })
    )

    // 5. Recherche d'une bande-annonce YouTube et sécurisation de son URL pour l'intégration en iframe
    this.trailerUrl$ = this.movie$.pipe(
      map(movie => {
        if (!movie.videos?.results) return null;

        const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

        if (trailer) {
          const rawUrl = `https://www.youtube.com/embed/${trailer.key}`;
          // Validation de l'URL par le DomSanitizer d'Angular pour contourner les blocages de sécurité (XSS)
          return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
        }

        return null;
      })
    );

    // 6. Extraction de la date de sortie française en ciblant en priorité la sortie officielle au cinéma (type 3)
    this.frenchReleaseDate$ = this.movie$.pipe(
      map(movie => {
        // 1. Recherche le bloc de résultats pour la France ("FR")
        const frResults = movie.release_dates?.results?.find(r => r.iso_3166_1 === 'FR');
        
        if (frResults) {
          // Type 3 correspond à la sortie officielle en salle (Theatrical)
          const cinemaRelease = frResults.release_dates.find(d => d.type === 3);
          
          // Retourne la date officielle si trouvée, sinon la première date alternative française disponible
          return cinemaRelease ? cinemaRelease.release_date : frResults.release_dates[0].release_date;
        }
        
        // Solution de secours : retour à la date de sortie internationale globale
        return movie.release_date; 
      })
    )
  }
}