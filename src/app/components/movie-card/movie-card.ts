import { Component, Input } from '@angular/core';
import { Movie } from '../../models/movie';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  imports: [DatePipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
})
export class MovieCard {

  // Input contenant les informations du film transmis par le composant parent
  @Input() movie!: Movie;

  constructor(private router: Router) {};

  /**
   * Redirige l'utilisateur vers la page de détails du film lors du clic sur la carte
   */
  onViewMovieDetails() {
    if (this.movie?.id) {
      this.router.navigateByUrl(`movie/${this.movie.id}`);
    }
  }
}
