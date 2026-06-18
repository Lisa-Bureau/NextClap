import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { MoviesService } from '../services/movies.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-releases',
  imports: [DatePipe, AsyncPipe, MovieCard],
  templateUrl: './movie-releases.html',
  styleUrl: './movie-releases.scss',
})
export class MovieReleases implements OnInit {

  movieReleases$!: Observable<Movie[]>;
  startDay!: Date;

  constructor(private moviesService: MoviesService) {}

  ngOnInit(): void {
    this.moviesService.getMovieReleasesFrenchCinema();
    this.startDay = this.moviesService.getCurrentWednesday();
  } 
}
