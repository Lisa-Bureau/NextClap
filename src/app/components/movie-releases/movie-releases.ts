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

  movieReleases$!: Observable<Movie[]>;
  startDay!: Date;
  
  constructor(private moviesService: MoviesService,
              private route: ActivatedRoute,
              private dateUtilsService: DateUtilsService) {};

  ngOnInit(): void {
    this.movieReleases$ = this.route.queryParams.pipe(
      switchMap(params => {
        const genreParam = params['genre'];
        const currentGenreId = genreParam ? Number(genreParam) : undefined;
        const currentSort = params['sort'] || '';
        
        return this.moviesService.getMovieReleasesFrenchCinema(currentGenreId, currentSort);
      })
    );

    this.startDay = this.dateUtilsService.getCurrentWednesday();
  } 

}
