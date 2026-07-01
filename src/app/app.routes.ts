import { Routes } from '@angular/router';
import { MovieReleases } from './movie-releases/movie-releases';
import { UpcomingMovieReleases } from './upcoming-movie-releases/upcoming-movie-releases';
import { NowPlayingMovies } from './now-playing-movies/now-playing-movies';

export const routes: Routes = [
    {path: "sorties", component: MovieReleases},
    {path: "prochainement", component: UpcomingMovieReleases},
    { path: "en-salle", component: NowPlayingMovies}
];
