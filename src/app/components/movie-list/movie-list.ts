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

  // Titre principal de la page transmis par le composant parent (ex: "Les Sorties")
  @Input() title!: string;

  // Sous-titre explicatif (ex: "Découvrez les films récemment sortis")
  @Input() subtitle!: string;

  // Flux réactif RxJS contenant la liste des films à afficher
  @Input() movies$!: Observable<Movie[]>;

}
