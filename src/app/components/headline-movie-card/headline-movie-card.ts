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

  @Input() headlineMovie!: MovieWithTag;

  constructor(private route: Router) {};

  onViewMovieDetails() {
    this.route.navigateByUrl(`movie/${this.headlineMovie.id}`);
  }
}
