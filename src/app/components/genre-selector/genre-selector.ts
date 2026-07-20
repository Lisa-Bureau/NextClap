import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AsyncPipe, UpperCasePipe, NgClass } from '@angular/common';
import { Genre } from '../../models/movie-genres';
import { GenresService } from '../../services/genres.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-genre-selector',
  imports: [AsyncPipe, UpperCasePipe, NgClass],
  templateUrl: './genre-selector.html',
  styleUrl: './genre-selector.scss',
})
export class GenreSelector implements OnInit {

  movieGenres$!: Observable<Genre[]>;
  genreActuallySelected?: number;

  constructor(private genresService: GenresService,
              private route: ActivatedRoute,
              private router: Router) {};

  selectGenre(genreId: number): void {
    const paramValue = genreId?.toString() ?? null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genre: paramValue },
      queryParamsHandling: 'merge'
    });
  }

  showAllMovies(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genre: null },
      queryParamsHandling: 'merge'
    });
  }

  ngOnInit(): void {
    this.movieGenres$ = this.genresService.getAllMovieGenre().pipe(
      map(genres =>
        genres.filter(genre => genre.id !== 10770)
      )
    );

    this.route.queryParams.subscribe(params => {
      const genreParam = params['genre'];

      this.genreActuallySelected = genreParam ? Number(genreParam) : undefined;
    });
  }
}
