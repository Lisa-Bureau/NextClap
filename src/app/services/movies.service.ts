import { Injectable } from "@angular/core";
import { forkJoin, map, Observable, switchMap, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Movie } from "../models/movie";
import { environment } from '../../environments/environment';
import { DiscoverMoviesResponse } from "../models/discover-movies-response";
import { ReleaseDatesResponse } from "../models/release-dates-response";
import { GenresService } from "./genres.service";

@Injectable({
    providedIn: "root"
})

export class MoviesService {

    constructor(private http: HttpClient, 
                private genresService: GenresService) {}

    getCurrentWednesday(): Date {
        const today = new Date();
        const day = today.getDay();

        const diff = day >= 3 ? day -3 : day + 4;

        const wednesday = new Date(today);
        wednesday.setDate(today.getDate() - diff);

        return wednesday;
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    getMovieReleases(): Observable<DiscoverMoviesResponse> {
        const releaseDay = this.getCurrentWednesday();
        
        return this.http.get<DiscoverMoviesResponse>(`${environment.tmdbUrl}/discover/movie`, {
            headers: {
                Authorization: `Bearer ${environment.tmdbToken}`
            },
            params: {
                language: 'fr-FR',
                region: 'FR',
                'primary_release_date.gte': this.formatDate(releaseDay),
                'primary_release_date.lte': this.formatDate(releaseDay),
                page: '1'
            }
        })
    }
    
    getReleaseDates(movieId: number): Observable<ReleaseDatesResponse> {
        return this.http.get<ReleaseDatesResponse>(`${environment.tmdbUrl}/movie/${movieId}/release_dates`, {
            headers: {
                Authorization: `Bearer ${environment.tmdbToken}`
            }
        })
    }

    private isFrenchCinema(releaseDates: ReleaseDatesResponse, expectedDate: string): boolean {
        const france = releaseDates.results.find(r => r.iso_3166_1 === 'FR');

        if (!france) {
            return false;
        }

        return france.release_dates.some(
            r => r.type === 3 && r.release_date.startsWith(expectedDate)
        );
    }

    getMovieReleasesFrenchCinema(genreId?: number): Observable<Movie[]> {

        return this.genresService.getAllMovieGenre().pipe(

            tap(genres =>
                this.genresService.setGenres(genres)
            ),

            switchMap(genre =>
                this.getMovieReleases()
            ),

            switchMap(response => {

                const releaseDay = this.getCurrentWednesday();
                const releaseDate = this.formatDate(releaseDay);

                const requests = response.results.map(movie =>
                    this.getReleaseDates(movie.id).pipe(
                        map(dates => ({
                            movie,
                            dates
                        }))
                    )
                );

                return forkJoin(requests).pipe(
                    map(results =>
                        results
                            .filter(({ dates }) =>
                                this.isFrenchCinema(dates, releaseDate)
                            )
                            .filter(({ movie }) => 
                                !genreId || movie.genre_ids.includes(genreId)
                            )
                            .map(({ movie }) => ({
                                ...movie,
                                genres: this.genresService.getGenreNames(movie.genre_ids)
                            }))
                    )
                );
            })
        );
    }
}