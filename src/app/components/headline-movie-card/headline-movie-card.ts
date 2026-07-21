import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { MovieWithTag } from '../../models/movie';
import { Router } from '@angular/router';
import { NgStyle, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-headline-movie-card',
  imports: [NgStyle, UpperCasePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './headline-movie-card.html',
  styleUrl: './headline-movie-card.scss',
})
export class HeadlineMovieCard {

  // Donnée du film mise en avant transmise par le composant parent
  @Input() headlineMovie!: MovieWithTag;

  constructor(private router: Router) {};

  /**
   * Redirige l'utilisateur vers la page de détail du film
   */
  onViewMovieDetails() {
    if (this.headlineMovie?.id) {
      this.router.navigateByUrl(`movie/${this.headlineMovie.id}`);
    }
  }
}
