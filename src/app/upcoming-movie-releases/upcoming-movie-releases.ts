import { Component, OnInit } from '@angular/core';
import { MoviesService } from '../services/movies.service';
import { GenresService } from '../services/genres.service';
import { DatePipe } from '@angular/common';
import { Observable, switchMap } from 'rxjs';
import { Movie } from '../models/movie';
import { MovieList } from '../movie-list/movie-list';
import { DateUtilsService } from '../services/date-utils.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-upcoming-movie-releases',
  imports: [MovieList, DatePipe],
  templateUrl: './upcoming-movie-releases.html',
  styleUrl: './upcoming-movie-releases.scss',
})
export class UpcomingMovieReleases implements OnInit{

  startDay!: Date;
  endDay!: Date;
  movieUpcoming$!: Observable<Movie[]>;

  constructor(private moviesService: MoviesService,
              private route: ActivatedRoute,
              private dateUtilsService: DateUtilsService) {};  

  filterMoviesByGenre(genreId?: number): void {
    this.movieUpcoming$ = this.moviesService.getUpcomingFrenchCinemaMovies(genreId);
  }

  showAlMovies(): void {
    this.movieUpcoming$ = this.moviesService.getUpcomingFrenchCinemaMovies();
  }

  ngOnInit(): void {
    this.startDay = this.dateUtilsService.getNextWednesday();
    this.endDay = this.dateUtilsService.getNextMonth();

    this.movieUpcoming$ = this.route.queryParams.pipe(
      switchMap(params => {
        const currentSort = params['sort'] || '';

        return this.moviesService.getUpcomingFrenchCinemaMovies(undefined, currentSort);
      })
    );
  }
}
