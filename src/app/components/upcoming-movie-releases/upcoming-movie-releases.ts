import { Component, OnInit } from '@angular/core';
import { MoviesService } from '../../services/movies.service';
import { DatePipe } from '@angular/common';
import { Observable, switchMap } from 'rxjs';
import { Movie } from '../../models/movie';
import { MovieList } from '../movie-list/movie-list';
import { DateUtilsService } from '../../services/date-utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upcoming-movie-releases',
  imports: [MovieList, DatePipe],
  templateUrl: './upcoming-movie-releases.html',
  styleUrl: './upcoming-movie-releases.scss',
})
export class UpcomingMovieReleases implements OnInit{

  // Date de début de la période (Mercredi prochain)
  startDay!: Date;

  // Date de fin de la période (Dans un mois)
  endDay!: Date;

  // Flux réactif des films à venir, mis à jour automatiquement selon les paramètres de l'URL
  movieUpcoming$!: Observable<Movie[]>;

  constructor(private moviesService: MoviesService,
              private route: ActivatedRoute,
              private dateUtilsService: DateUtilsService) {};  

  ngOnInit(): void {
    // Calcul de la plage de dates pour la section "Prochainement"
    this.startDay = this.dateUtilsService.getNextWednesday();
    this.endDay = this.dateUtilsService.getNextMonth();

    // switchMap permet d'annuler la requête précédente si l'utilisateur change de filtre très vite
    this.movieUpcoming$ = this.route.queryParams.pipe(
      switchMap(params => {
        const genreParam = params['genre'];
        const currentGenreId = genreParam ? Number(genreParam) : undefined;
        const currentSort = params['sort'] || '';

        return this.moviesService.getUpcomingFrenchCinemaMovies(currentGenreId, currentSort);
      })
    );
  }
}
