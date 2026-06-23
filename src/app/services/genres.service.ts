import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Genre, MovieGenres } from "../models/movie-genres";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root"
})

export class GenresService {

    constructor(private http: HttpClient) {};

    getAllMovieGenre(): Observable<Genre[]> {
        return this.http.get<MovieGenres>(`${environment.tmdbUrl}/genre/movie/list`, {
            headers: {
                Authorization: `Bearer ${environment.tmdbToken}`
            },
            params: {
                language: 'fr-FR'
            }
        })
        .pipe(
            map(response => response.genres)
        );
    }

    private genres = new Map<number, string>();

    setGenres(genres: Genre[]) {
        genres.forEach(genre => 
            this.genres.set(genre.id, genre.name)
        );
    }

    getGenreName(id: number): string {
        return this.genres.get(id) ?? "";
    }

    getGenreNames(ids: number[]): string[] {
        return ids
            .map(id => this.genres.get(id))
            .filter(Boolean) as string[];
    }

}