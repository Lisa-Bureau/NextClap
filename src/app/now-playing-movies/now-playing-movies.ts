import { Component, OnInit } from '@angular/core';
import { MovieList } from '../movie-list/movie-list';
import { Observable, tap } from 'rxjs';
import { Movie } from '../models/movie';
import { MoviesService } from '../services/movies.service';

@Component({
  selector: 'app-now-playing-movies',
  imports: [MovieList],
  templateUrl: './now-playing-movies.html',
  styleUrl: './now-playing-movies.scss',
})
export class NowPlayingMovies implements OnInit {

  movieNowPlaying$!: Observable<Movie[]>;

  constructor (private moviesService: MoviesService) {};

  filterMoviesByGenre(genreId?: number): void {
    this.movieNowPlaying$ = this.moviesService.getNowPlayingFrenchCinemaMovies(genreId);
  }

  showAllMovies(): void {
    this.movieNowPlaying$ = this.moviesService.getNowPlayingFrenchCinemaMovies();
  }

  ngOnInit(): void {
    this.movieNowPlaying$ = this.moviesService.getNowPlayingFrenchCinemaMovies();
  }
}
