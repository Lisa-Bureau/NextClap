import { Component, Input } from '@angular/core';
import { Movie } from '../models/movie';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  imports: [DatePipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {
  @Input() movie!: Movie;

  constructor(private route: Router) {};

  onViewMovieDetails() {
    this.route.navigateByUrl(`movie/${this.movie.id}`);
  }
}
