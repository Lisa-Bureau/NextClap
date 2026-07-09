import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, map, Observable } from 'rxjs';
import { Movie, MovieWithTag } from '../models/movie';
import { MoviesService } from '../services/movies.service';
import { AsyncPipe } from '@angular/common';
import { MovieCard } from '../movie-card/movie-card';
import { HeadlineMovieCard } from '../headline-movie-card/headline-movie-card';
import { Carousel } from 'primeng/carousel';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, AsyncPipe, MovieCard, HeadlineMovieCard, Carousel],
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

  /** Flux contenant les deux films les plus populaires de chaque catégorie (release, upcoming, nowplaying) */
  headlineMovies$!: Observable<MovieWithTag[]>;

  constructor(private moviesService : MoviesService) {};

  /**
   * Méthode utilitaire (Pipeline RxJS) permettant de transformer un flux de films
   * en un nouveau flux restreint à 4 films uniques choisis totalement au hasard.
   * @param {Observable<Movie[]>} movies - Le flux (Observable) de films source à transformer.
   * @returns {Observable<Movie[]>} Un nouveau flux contenant exactement 4 films aléatoires.
   */
  getRandomMoviesForSection(movies: Observable<Movie[]>): Observable<Movie[]> {
    return movies.pipe(
      map(moviesArray => {
        // Sécurité : si l'API renvoie un tableau vide ou indéfini, on retourne un tableau vide
        if (!movies || moviesArray.length === 0) return [];

        // Création d'une copie superficielle et tri aléatoire 
        const shuffled = [...moviesArray].sort(() => 0.5 - Math.random());

        // Extraction des 4 premiers éléments du tableau mélangé
        return shuffled.slice(0, 4);
      })
    );
  }

  /**
   * Méthode utilitaire (Pipeline RxJS) permettant de transformer un flux de films
   * en un nouveau flux restreint aux 2 films les plus populaire de chaque catégorie.
   * @param {Observable<Movie[]>} movies - Le flux (Observable) de films source à transformer.
   * @returns {Observable<Movie[]>} Un nouveau flux contenant exactement les 2 films les plus populaires.
   */
  getMostPopularMovies(movies: Observable<Movie[]>): Observable<Movie[]> {
    return movies.pipe(
      map(moviesArray => {
        if (!movies || moviesArray.length === 0) return [];

        const mostPopularMovies = [...moviesArray].sort((a, b) => b.popularity - a.popularity);

        return mostPopularMovies.slice(0, 2);
      })
    )
  }

  /**
   * Initialisation du composant.
   * Déclenche les requêtes API via le service et applique le filtre aléatoire sur chaque catégorie.
   */
  ngOnInit(): void {
    // Initialisation des flux de données en combinant les appels de services avec la méthode de tri
    this.movieReleases$ = this.getRandomMoviesForSection(this.moviesService.getMovieReleasesFrenchCinema());
    this.moviesUpcoming$ = this.getRandomMoviesForSection(this.moviesService.getUpcomingFrenchCinemaMovies());
    this.moviesNowPlaying$ = this.getRandomMoviesForSection(this.moviesService.getNowPlayingFrenchCinemaMovies());

    this.headlineMovies$ = forkJoin([

      // Catégorie : Les sorties récentes (Releases)
      this.getMostPopularMovies(this.moviesService.getMovieReleasesFrenchCinema()).pipe(
        // map (RxJS) : Intercepte le tableau de films émis par l'Observable
        // .map (JS)  : Parcourt chaque film pour lui injecter le tag "release" sans modifier l'objet d'origine
        map(movies => movies.map(movie => ({ ...movie, categoryTag: "release" as const })))
      ),

      // Catégorie : Les films à venir (Upcoming)
      this.getMostPopularMovies(this.moviesService.getUpcomingFrenchCinemaMovies()).pipe(
        // Le "as const" fige la chaîne de caractères pour correspondre exactement au typage strict attendu
        map(movies => movies.map(movie => ({ ...movie, categoryTag: "upcoming" as const })))
      ),

      // Catégorie : Les films actuellement en salle (Now Playing)
      this.getMostPopularMovies(this.moviesService.getNowPlayingFrenchCinemaMovies()).pipe(
        map(movies => movies.map(movie => ({ ...movie, categoryTag: "nowplaying" as const })))
      )
    ]).pipe(
      // map (RxJS) : Reçoit un tableau de tableaux contenant toutes les catégories taguées : [[2 films], [2 films], [2 films]]
      map(allCategories => {
        // 1. .flat() : Fusionne (aplatit) les 3 sous-tableaux en un seul grand tableau unique de 12 films
        // 2. .sort(...) : Mélange aléatoirement l'ensemble des 12 films pour casser le regroupement par catégorie à l'affichage
        return allCategories.flat().sort(() => 0.5 - Math.random());
      })
    )
  }
}
