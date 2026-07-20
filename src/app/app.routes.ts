import { Routes } from '@angular/router';
import { MovieReleases } from './components/movie-releases/movie-releases';
import { UpcomingMovieReleases } from './components/upcoming-movie-releases/upcoming-movie-releases';
import { NowPlayingMovies } from './components/now-playing-movies/now-playing-movies';
import { MovieDetails } from './components/movie-details/movie-details';
import { LandingPage } from './components/landing-page/landing-page';

export const routes: Routes = [
    { path: "", component: LandingPage},
    { path: "sorties", component: MovieReleases },
    { path: "prochainement", component: UpcomingMovieReleases },
    { path: "en-salle", component: NowPlayingMovies },
    { path: "movie/:id", component: MovieDetails }
];
