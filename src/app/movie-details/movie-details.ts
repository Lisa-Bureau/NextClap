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

  movie$!: Observable<MovieDetail>;
  directors$!: Observable<string | undefined>;
  casting$!: Observable<string | undefined>;
  trailerUrl$!: Observable<SafeResourceUrl | null>;
  frenchReleaseDate$! : Observable<string | null>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private moviesService: MoviesService,
              private sanitizer: DomSanitizer) {};

  goBackPage(): void {
    // On récupère l'état de l'historique
    const currentHistory = window.history.length;

    if (currentHistory > 1) {
      this.location.back(); // Retour à la page d'où il venait
    } else {
      this.router.navigateByUrl("/"); // Sécurité : Accueil si aucun historique
    }
  }

  ngOnInit(): void {
    const movieId = this.route.snapshot.params["id"];
    this.movie$ = this.moviesService.getMovieById(movieId);

    this.directors$ = this.movie$.pipe(
      map(movie => {
        const directors = movie.credits?.crew?.filter(person => person.job === "Director");
        if (directors && directors.length > 0) {
          return directors.map(d => d.name).join(", ");
        }
        
        return 'Réalisateur inconnu';
      })
    )

    this.casting$ = this.movie$.pipe(
      map(movie => {
        const casting = movie.credits?.cast?.slice(0, 5);
        return casting?.map(actor => actor.name).join(", ")
      })
    )

    this.trailerUrl$ = this.movie$.pipe(
      map(movie => {
        if (!movie.videos?.results) return null;

        // On cherche la vidéo de type Trailer sur YouTube
        const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

        if (trailer) {
          const rawUrl = `https://www.youtube.com/embed/${trailer.key}`;
          // 🔒 On sécurise et on retourne directement l'URL sécurisée dans le flux
          return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
        }

        return null;
      })
    );

    this.frenchReleaseDate$ = this.movie$.pipe(
      map(movie => {
        // 1. On cherche le bloc de résultats pour la France ("FR")
        const frResults = movie.release_dates?.results?.find(r => r.iso_3166_1 === 'FR');
        
        if (frResults) {
          // On cherche en priorité la date de type 3 (Theatrical / Sortie cinéma)
          const cinemaRelease = frResults.release_dates.find(d => d.type === 3);
          
          // Si trouvée, on la renvoie, sinon on prend la première disponible pour la France
          return cinemaRelease ? cinemaRelease.release_date : frResults.release_dates[0].release_date;
        }
        
        // Si pas de date FR trouvée, on garde la date par défaut mondiale en secours
        return movie.release_date; 
      })
    )
  }
}