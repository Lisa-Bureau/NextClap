import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Movie } from '../models/movie';
import { MoviesService } from '../services/movies.service';
import { AsyncPipe } from '@angular/common';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, AsyncPipe, MovieCard],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage implements OnInit {

  /** Flux contenant une sélection aléatoire de films récemment sortis */
  movieReleases$!: Observable<Movie[]>;

  /** Flux contenant une sélection aléatoire de films très prochainement au cinéma */
  moviesUpcoming$!: Observable<Movie[]>;

  /** Flux contenant une sélection aléatoire de films actuellement à l'affiche */
  moviesNowPlaying$!: Observable<Movie[]>;

  constructor(private moviesService : MoviesService) {};

  /**
   * Méthode utilitaire (Pipeline RxJS) permettant de transformer un flux de films
   * en un nouveau flux restreint à 4 films uniques choisis totalement au hasard.
   * @param {Observable<Movie[]>} movies - Le flux (Observable) de films source à transformer.
   * @returns {Observable<Movie[]>} Un nouveau flux contenant exactement 4 films aléatoires.
   */
  getRandomMovies(movies: Observable<Movie[]>): Observable<Movie[]> {
    return movies.pipe(
      map(movies => {
        // Sécurité : si l'API renvoie un tableau vide ou indéfini, on retourne un tableau vide
        if (!movies || movies.length === 0) return [];

        // Création d'une copie superficielle et tri aléatoire 
        const shuffled = [...movies].sort(() => 0.5 - Math.random());

        // Extraction des 4 premiers éléments du tableau mélangé
        return shuffled.slice(0, 4);
      })
    ) 
  }

  /**
   * Initialisation du composant.
   * Déclenche les requêtes API via le service et applique le filtre aléatoire sur chaque catégorie.
   */
  ngOnInit(): void {
    // Initialisation des flux de données en combinant les appels de services avec la méthode de tri
    this.movieReleases$ = this.getRandomMovies(this.moviesService.getMovieReleasesFrenchCinema());
    this.moviesUpcoming$ = this.getRandomMovies(this.moviesService.getUpcomingFrenchCinemaMovies());
    this.moviesNowPlaying$ = this.getRandomMovies(this.moviesService.getNowPlayingFrenchCinemaMovies());
  }
}
