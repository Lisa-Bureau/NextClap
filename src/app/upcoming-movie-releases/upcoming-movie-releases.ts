import { Component, OnInit } from '@angular/core';
import { MoviesService } from '../services/movies.service';
import { GenresService } from '../services/genres.service';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { MovieList } from '../movie-list/movie-list';
import { DateUtilsService } from '../services/date-utils.service';

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

  constructor (private moviesServise: MoviesService,
               private dateUtilsService: DateUtilsService) {};  

  filterMoviesByGenre(genreId?: number): void {
    this.movieUpcoming$ = this.moviesServise.getUpcomingFrenchCinemaMovies(genreId);
  }

  showAlMovies(): void {
    this.movieUpcoming$ = this.moviesServise.getUpcomingFrenchCinemaMovies();
  }

  ngOnInit(): void {
    this.startDay = this.dateUtilsService.getNextWednesday();
    this.endDay = this.dateUtilsService.getNextMonth();
    this.movieUpcoming$ = this.moviesServise.getUpcomingFrenchCinemaMovies();
    }
}
