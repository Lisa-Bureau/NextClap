import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Genre, MovieGenres } from "../models/movie-genres";
import { environment } from "@env/environment";


@Injectable({
    providedIn: "root"  // Service disponible dans toute l'application (Singleton)
})

export class GenresService {

    // Cache interne sous forme de Map (clé: id du genre, valeur: nom du genre)
    private genres = new Map<number, string>();

    constructor(private http: HttpClient) {};

    /**
     * Récupère la liste complète des genres de films depuis l'API TMDB en français.
     * @returns Un Observable émettant le tableau des genres disponibles
     */
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
            // Extrait uniquement le tableau 'genres' de la réponse d'API
            map(response => response.genres)
        );
    }

    /**
     * Alimente le cache interne Map avec la liste des genres récupérés.
     * @param genres Liste des genres à mettre en cache
     */
    setGenres(genres: Genre[]) {
        genres.forEach(genre => 
            this.genres.set(genre.id, genre.name)
        );
    }

    /**
     * Retourne le nom d'un genre à partir de son ID (ou une chaîne vide si non trouvé).
     * @param id L'identifiant unique du genre (ex: 28 pour Action)
     * @returns Le libellé du genre, ou une chaîne vide si l'ID n'est pas trouvé dans le cache
     */
    getGenreName(id: number): string {
        return this.genres.get(id) ?? "";
    }

    /**
     * Convertit un tableau d'IDs de genres en un tableau de noms de genres associés.
     * @param ids Tableau d'identifiants uniques de genres
     * @returns Tableau contenant uniquement les noms des genres trouvés dans le cache
     */
    getGenreNames(ids: number[]): string[] {
        return ids
            .map(id => this.genres.get(id))
            .filter(Boolean) as string[];   // Filtre les valeurs undefined si un ID n'est pas en cache
    }

}