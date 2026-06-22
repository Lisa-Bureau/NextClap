import { Component, Input } from '@angular/core';
import { Movie } from '../models/movie';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  imports: [DatePipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {
  @Input() movie!: Movie;
}
