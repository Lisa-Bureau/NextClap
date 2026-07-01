import { Component, signal } from '@angular/core';
import { UpcomingMovieReleases } from './upcoming-movie-releases/upcoming-movie-releases';
import { MovieReleases } from './movie-releases/movie-releases';
import { NowPlayingMovies } from './now-playing-movies/now-playing-movies';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('NextClap');
}
