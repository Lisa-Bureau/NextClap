import { Component, signal } from '@angular/core';
import { MovieReleases } from './movie-releases/movie-releases';

@Component({
  selector: 'app-root',
  imports: [MovieReleases],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('NextClap');
}
