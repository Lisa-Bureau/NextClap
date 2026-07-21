import { Component, OnInit } from '@angular/core';
import { MovieList } from '../movie-list/movie-list';
import { Observable, switchMap } from 'rxjs';
import { Movie } from '../../models/movie';
import { MoviesService } from '../../services/movies.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-now-playing-movies',
  imports: [MovieList],
  templateUrl: './now-playing-movies.html',
  styleUrl: './now-playing-movies.scss',
})
export class NowPlayingMovies implements OnInit {

  // Flux réactif réagissant aux filtres de l'URL pour charger les films en salle
  movieNowPlaying$!: Observable<Movie[]>;

  constructor(private moviesService: MoviesService,
              private route: ActivatedRoute) {};

  ngOnInit(): void {
    // switchMap permet d'annuler la requête précédente si l'utilisateur change de filtre très vite
    this.movieNowPlaying$ = this.route.queryParams.pipe(
      switchMap(params => {
        const genreParam = params['genre'];
        const currentGenreId = genreParam ? Number(genreParam) : undefined;
        const currentSort = params['sort'] || '';
        
        return this.moviesService.getNowPlayingFrenchCinemaMovies(currentGenreId, currentSort);
      })
    );
  }
}
