import { Component, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Movie } from '../../models/movie';
import { MoviesService } from '../../services/movies.service';
import { DatePipe } from '@angular/common';
import { MovieList } from '../movie-list/movie-list';
import { DateUtilsService } from '../../services/date-utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-movie-releases',
  imports: [DatePipe, MovieList],
  templateUrl: './movie-releases.html',
  styleUrl: './movie-releases.scss',
})
export class MovieReleases implements OnInit {

  // Flux réactif réagissant aux filtres de l'URL pour charger les sorties cinéma
  movieReleases$!: Observable<Movie[]>;

  // Date du mercredi de la semaine en cours (jour officiel des sorties ciné en France)
  startDay!: Date;
  
  constructor(private moviesService: MoviesService,
              private route: ActivatedRoute,
              private dateUtilsService: DateUtilsService) {};

  ngOnInit(): void {
    // switchMap permet d'annuler la requête précédente si l'utilisateur change de filtre très vite
    this.movieReleases$ = this.route.queryParams.pipe(
      switchMap(params => {
        const genreParam = params['genre'];
        const currentGenreId = genreParam ? Number(genreParam) : undefined;
        const currentSort = params['sort'] || '';
        
        return this.moviesService.getMovieReleasesFrenchCinema(currentGenreId, currentSort);
      })
    );

    // Calcul de la date de départ (mercredi courant)
    this.startDay = this.dateUtilsService.getCurrentWednesday();
  } 

}
