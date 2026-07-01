import { Injectable } from "@angular/core";
import { EMPTY, expand, filter, forkJoin, map, Observable, reduce, switchMap, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { DiscoverMoviesResponse, Movie } from "../models/movie";
import { environment } from '../../environments/environment';
import { GenresService } from "./genres.service";
import { DateUtilsService } from "./date-utils.service";

@Injectable({
    providedIn: "root"
})

export class MoviesService {

    constructor(private http: HttpClient, 
                private genresService: GenresService,
                private dateUtilsService: DateUtilsService) {}

    /**
     * Gère la pagination récursive pour extraire l'intégralité du catalogue d'un endpoint TMDB.
     * @param {any} params - Critères de filtrage à envoyer à l'API Discover.
     * @returns {Observable<DiscoverMoviesResponse>} Flux contenant la totalité des films cumulés.
     * @private
     */
    private fetchAllPages(params: any): Observable<DiscoverMoviesResponse> {
        // Fonction utilitaire locale pour factoriser la configuration des requêtes HTTP par page
        const makeRequest = (page: number) => {
            return this.http.get<DiscoverMoviesResponse>(`${environment.tmdbUrl}/discover/movie`, {
                headers: { Authorization: `Bearer ${environment.tmdbToken}` },
                params: { ...params, page: page.toString() }
            });
        };

        // Initialisation de la récursion à la page 1
        return makeRequest(1).pipe(
            // Boucle récursive : tant qu'il reste des pages, on charge la page suivante, sinon on coupe le flux (EMPTY)
            expand(response => response.page < response.total_pages ? makeRequest(response.page + 1) : EMPTY),

            // Accumulateur : attend la fin de la récursion pour fusionner tous les tableaux 'results' en un seul objet
            reduce((acc, current) => ({
                ...acc,
                results: [...acc.results, ...current.results]
            }))
        );
    }

    /**
     * Applique un tri de sécurité drastique sur les données brutes de TMDB.
     * L'API TMDB incluant des ressorties de vieux films, des fiches incomplètes ou non traduites,
     * ce nettoyage garantit la pertinence du catalogue "Salles de cinéma actuelles".
     * @param {Movie[]} movies - Tableau de films bruts issus de l'API.
     * @param {number} [genreId] - ID optionnel du genre à filtrer.
     * @param {Date} [targetDate] - Date de référence pour valider l'année de sortie.
     * @param {string[]} [releaseDates] - Tableau des dates de sortie du mois.
     * @returns {Movie[]} Tableau filtré, nettoyé et documenté avec le nom des genres.
     * @private
     */
    private mapAndFilterGenres(movies: Movie[], genreId?: number, targetDate?: Date, releaseDates?: string[], minPopularity?: number): Movie[] {
        const currentYear = targetDate ? targetDate.getFullYear() : new Date().getFullYear();

        return movies
            // 1. Cohérence des données : Élimination des fiches sans titre
            .filter(movie => movie.title?.trim() !== '')

            // 2. Localisation linguistique : Exclusion des titres en caractères non-latins (arabe, cyrillique, asiatique...)
            // car TMDB manque parfois de traductions françaises sur les films très spécifiques.
            .filter(movie => {
                const latinRegex = /^[a-zA-Z0-9\s\.,;:!\?'"«»À-ÖØ-öø-ÿ\-\(\)&€\$€’]+$/;
                return latinRegex.test(movie.title);
            })

            // 3. Qualité de contenu : Un film distribué en salle possède obligatoirement un résumé en français.
            .filter(movie => movie.overview && movie.overview.trim().length > 10)

            // 4. Exclusion des ressorties : Évite que des classiques (ex: 1965, 1996) restaurés en salle 
            // ne polluent les nouveautés de l'année.
            .filter(movie => {
                if (!movie.release_date) return false;
                const movieYear = new Date(movie.release_date).getFullYear();
                return movieYear === currentYear;
            })

            // 5. Qualité de contenu : Élimination des films sans affiche.
            .filter(movie => movie.poster_path)

            // 6. Si on a fourni une liste de mercredis spécifiques, on vérifie si la date du film y figure
            .filter(movie => {
                if (!releaseDates) return true; // Si pas de liste fournie (ex: sur d'autres pages), on laisse passer
                return releaseDates.includes(movie.release_date.toString());
            })

            .filter(movie => {
                if (!minPopularity) return true;

                // Condition A : Le film a un très gros score (ex: > 5), on le garde direct (peu importe sa date)
                const isBigMovieStillPlaying = movie.popularity > minPopularity;

                // Condition B : Le film a un score plus modeste mais sort pile CE mercredi (aujourd'hui)
                const isNewReleaseThisWeek = movie.popularity > 0.5 && 
                                            movie.release_date.toString() === this.dateUtilsService.formatDate(this.dateUtilsService.getCurrentWednesday());

                // On garde le film s'il valide la condition A OU la condition B
                return isBigMovieStillPlaying || isNewReleaseThisWeek;
            })

            // 7. Filtre utilisateur : Sélection optionnelle par genre cinématographique
            .filter(movie => !genreId || movie.genre_ids.includes(genreId))

            // 8. Mapping : Remplacement des IDs de genres anonymes par leurs libellés textuels (ex: "Action")
            .map(movie => ({
                ...movie,
                genres: this.genresService.getGenreNames(movie.genre_ids)
            }));
    }

    /**
     * Récupère les films sortis nationalement au cinéma le mercredi de la semaine en cours.
     * Utilise switchMap pour annuler automatiquement les requêtes obsolètes en cas de clics rapides.
     * @param {number} [genreId] - ID du genre pour le filtrage optionnel.
     * @returns {Observable<Movie[]>} Flux de films à venir nettoyés et filtrés.
     */
    getMovieReleasesFrenchCinema(genreId?: number): Observable<Movie[]> {
        
        const currentWednesday = this.dateUtilsService.getCurrentWednesday();
        
        return this.genresService.getAllMovieGenre().pipe(
            tap(genres => this.genresService.setGenres(genres)),
            switchMap(() => this.fetchAllPages({
                language: 'fr-FR',
                region: 'FR',
                with_release_type: '3', // Code 3 = Sortie nationale en salle uniquement
                'release_date.gte': this.dateUtilsService.formatDate(currentWednesday), 
                'release_date.lte': this.dateUtilsService.formatDate(currentWednesday)
            })),
            map(response => this.mapAndFilterGenres(response.results, genreId, currentWednesday))
        );
    }

    /**
     * Récupère les films qui vont sortir nationalement au cinéma entre le mercredi de la semaine suivante et le mois d'après.
     * Utilise switchMap pour annuler automatiquement les requêtes obsolètes en cas de clics rapides.
     * @param {number} [genreId] - ID du genre pour le filtrage optionnel.
     * @returns {Observable<Movie[]>} Flux de films à venir nettoyés et filtrés.
     */
    getUpcomingFrenchCinemaMovies(genreId?: number): Observable<Movie[]> {

        const startDate = this.dateUtilsService.getNextWednesday();
        const endDate = this.dateUtilsService.getNextMonth(); 
        const releaseDates = this.dateUtilsService.getWednesdaysUpcomingList(startDate, endDate);

        return this.genresService.getAllMovieGenre().pipe(
            tap(genres => this.genresService.setGenres(genres)),
            switchMap(() => this.fetchAllPages({
                language: 'fr-FR',
                region: 'FR',
                with_release_type: '3', // Code 3 = Sortie nationale en salle uniquement
                'release_date.gte': this.dateUtilsService.formatDate(startDate), 
                'release_date.lte': this.dateUtilsService.formatDate(endDate)  
            })),
            map(response => this.mapAndFilterGenres(response.results, genreId, startDate, releaseDates)),
        );
    }

    /**
     * Récupère les films sont à l'affiche entre le mercredi 12 semaines avant et le mercredi de la semaine en cours.
     * Utilise switchMap pour annuler automatiquement les requêtes obsolètes en cas de clics rapides.
     * @param {number} [genreId] - ID du genre pour le filtrage optionnel.
     * @returns {Observable<Movie[]>} Flux de films à venir nettoyés et filtrés.
     */
    getNowPlayingFrenchCinemaMovies(genreId?: number): Observable<Movie[]> {

        const startDate = this.dateUtilsService.getPreviousWednesday();
        const endDate = this.dateUtilsService.getCurrentWednesday(); 
        const releaseDates = this.dateUtilsService.getWednesdaysUpcomingList(startDate, endDate);
        const minPopularity = 5;

        return this.genresService.getAllMovieGenre().pipe(
            tap(genres => this.genresService.setGenres(genres)),
            switchMap(() => this.fetchAllPages({
                language: 'fr-FR',
                region: 'FR',
                with_release_type: '3', // Code 3 = Sortie nationale en salle uniquement
                'release_date.gte': this.dateUtilsService.formatDate(startDate), 
                'release_date.lte': this.dateUtilsService.formatDate(endDate)  
            })),
            map(response => this.mapAndFilterGenres(response.results, genreId, startDate, releaseDates, minPopularity)),
        );
    }
}