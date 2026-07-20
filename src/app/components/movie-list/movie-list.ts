import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '../../models/movie';
import { GenreSelector } from '../genre-selector/genre-selector';
import { AsyncPipe } from '@angular/common';
import { MovieCard } from '../movie-card/movie-card';
import { SortSelector } from '../sort-selector/sort-selector';

@Component({
  selector: 'app-movie-list',
  imports: [GenreSelector, AsyncPipe, MovieCard, SortSelector],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss',
})
export class MovieList {

  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() movies$!: Observable<Movie[]>;

}
