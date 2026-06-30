import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { MoviesService } from '../services/movies.service';
import { DatePipe } from '@angular/common';
import { MovieList } from '../movie-list/movie-list';
import { DateUtilsService } from '../services/date-utils.service';

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
              private dateUtilsService: DateUtilsService) {};

  sortByGenre(genreId?: number): void {
    this.movieReleases$ = this.moviesService.getMovieReleasesFrenchCinema(genreId);
  }

  showAll(): void {
    this.movieReleases$ = this.moviesService.getMovieReleasesFrenchCinema();
  }

  ngOnInit(): void {
    this.movieReleases$ = this.moviesService.getMovieReleasesFrenchCinema();

    this.startDay = this.dateUtilsService.getCurrentWednesday();
  } 

}
