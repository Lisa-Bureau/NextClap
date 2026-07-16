import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AsyncPipe, UpperCasePipe, NgClass } from '@angular/common';
import { Genre } from '../models/movie-genres';
import { GenresService } from '../services/genres.service';

@Component({
  selector: 'app-genre-selector',
  imports: [AsyncPipe, UpperCasePipe, NgClass],
  templateUrl: './genre-selector.html',
  styleUrl: './genre-selector.scss',
})
export class GenreSelector implements OnInit {

  @Output() genreSelected = new EventEmitter<number | undefined>();
  movieGenres$!: Observable<Genre[]>;
  genreActuallySelected?: number;

  constructor(private genresService: GenresService) {};

  selectGenre(genreId: number): void {
    this.genreSelected.emit(genreId);
    this.genreActuallySelected = genreId;
  }

  showAllMovies(): void {
    this.genreSelected.emit(undefined);
    this.genreActuallySelected = undefined;
  }

  ngOnInit(): void {
    this.movieGenres$ = this.genresService.getAllMovieGenre().pipe(
      map(genres =>
        genres.filter(genre => genre.id !== 10770)
      )
    );
  }
}
