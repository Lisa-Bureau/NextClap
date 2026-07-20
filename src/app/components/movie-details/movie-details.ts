import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay, switchMap } from 'rxjs';
import { MoviesService } from '../../services/movies.service';
import { MovieDetail } from '../../models/movie-details';
import { AsyncPipe, DatePipe, NgStyle, UpperCasePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationService } from '../../services/navigation.service';

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
              private navigationService: NavigationService,
              private moviesService: MoviesService,
              private sanitizer: DomSanitizer) {};

  /**
   * Gère le retour à la page précédente de manière intelligente et sécurisée.
   * Au lieu de faire un simple retour en arrière dans l'historique du navigateur 
   * (qui pourrait reculer vers un autre film), cette méthode consulte le NavigationService 
   * pour obtenir une destination cohérente.
   */
  goBackPage(): void {
    // 1. On demande au service de navigation de calculer l'URL de retour valide (soit un Hub autorisé, soit l'accueil)
    const targetUrl = this.navigationService.getValidPreviousUrl();

    // 2. On déclenche la redirection officielle d'Angular vers cette URL sécurisée
    this.router.navigateByUrl(targetUrl);
  }

  /**
   * Initialisation du composant et configuration des flux de données réactifs.
   */
  ngOnInit(): void {
    this.movie$ = this.route.paramMap.pipe(
      // 1. On extrait uniquement le paramètre 'id' depuis la carte des paramètres de l'URL
      map(params => params.get('id')),

      // 2. On transforme l'ID en flux de données du film.
      // switchMap annule automatiquement la requête précédente si l'ID change entre-temps.
      // Le '+' convertit la chaîne de caractères de l'URL en 'number' pour ton service.
      switchMap(movieId => this.moviesService.getMovieById(+movieId!)),

      // 3. On partage le résultat de la requête HTTP avec tous les autres Observables dépendants.
      // Évite de déclencher plusieurs requêtes réseau identiques pour le même film.
      shareReplay(1) 
    );

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