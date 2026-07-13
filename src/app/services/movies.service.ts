import { Injectable } from "@angular/core";
import { BehaviorSubject, EMPTY, expand, forkJoin, map, Observable, reduce, switchMap, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { DiscoverMoviesResponse, Movie } from "../models/movie";
import { environment } from '../../environments/environment';
import { GenresService } from "./genres.service";
import { DateUtilsService } from "./date-utils.service";
import { MovieDetail } from "../models/movie-details";

@Injectable({
    providedIn: "root"
})

export class MoviesService {

    constructor(private http: HttpClient, 
                private genresService: GenresService,
                private dateUtilsService: DateUtilsService) {}

    // Le conteneur de données réactif (Source de vérité)
    // Un BehaviorSubject garde toujours en mémoire sa dernière valeur (ici, un tableau vide [] au départ).
    // Tous les composants abonnés recevront automatiquement la liste des films dès qu'elle sera mise à jour.
    private loadedMovies$ = new BehaviorSubject<Movie[]>([]);

    /**
     * MÉTHODE DÉDIÉE AU CATALOGUE DE RECHERCHE GLOBAL
     * * Pourquoi cette méthode existe à côté de 'mapAndFilterGenres' ?
     * -> Pour la barre de recherche, le genre du film n'importe pas (on veut TOUS les films).
     * -> Cette méthode se concentre uniquement sur la récupération brute et le nettoyage de sécurité.
     * -> Elle n'applique PAS de filtre de genre et n'alourdit pas la mémoire à traduire les IDs 
     * de genres en texte (ex: "Action"), car le dropdown n'affiche que le titre.
     */
    private fetchMoviesForSearch(params: any, targetDate: Date, releaseDates?: string[], minPopularity?: number): Observable<Movie[]> {
        
        // 1. On appelle l'API pour récupérer TOUTES les pages de résultats
        return this.fetchAllPages(params).pipe(
            map(response => {
                // On extrait l'année de la date cible pour s'assurer que les films correspondent à cette année
                const currentYear = targetDate.getFullYear();
                
                // On prend le tableau de films reçus (.results) et on le passe au tamis (filtres)
                return response.results
                    // Filtre 1 : Le titre ne doit pas être vide ou composé uniquement d'espaces
                    .filter(movie => movie.title?.trim() !== '')

                    // Filtre 2 : Sécurité anti-caractères bizarres. Le titre doit contenir uniquement des lettres (avec accents français),
                    // des chiffres, des espaces et de la ponctuation classique. Élimine les titres en emoji, arabe, cyrillique, etc.
                    .filter(movie => /^[a-zA-Z0-9\s\.,;:!\?'"«»À-ÖØ-öø-ÿ\-\(\)&€\$€’]+$/.test(movie.title))

                    // Filtre 3 : Le film doit avoir un résumé (overview) d'au moins 10 caractères (évite les fiches vides)
                    .filter(movie => movie.overview && movie.overview.trim().length > 10)

                    // Filtre 4 : Le film doit avoir une date de sortie, et son année doit correspondre à l'année cible
                    .filter(movie => movie.release_date && new Date(movie.release_date).getFullYear() === currentYear)

                    // Filtre 5 : Le film doit obligatoirement avoir une image d'affiche (poster)
                    .filter(movie => movie.poster_path)

                    // Filtre 6 : Si une liste de dates spécifiques (mercredis) est fournie, on garde uniquement les films sortis à ces dates
                    .filter(movie => !releaseDates || releaseDates.includes(movie.release_date.toString()))

                    // Filtre 7 : Tri par popularité (évite d'afficher des films totalement inconnus)
                    .filter(movie => {
                        if (!minPopularity) return true;    // Pas de limite de popularité ? On garde le film.
                        const isBigMovie = movie.popularity > minPopularity;     // Le film dépasse le score de popularité requis
                        
                        // Exception "Nouveauté" : Si le film sort CE mercredi, on baisse les exigences de popularité (seuil à 0.5)
                        const isNewThisWeek = movie.popularity > 0.5 && movie.release_date.toString() === this.dateUtilsService.formatDate(this.dateUtilsService.getCurrentWednesday());
                        return isBigMovie || isNewThisWeek;
                    });
            })
        );
    }

    /**
     * Initialise le catalogue global en lançant 3 requêtes en parallèle :
     * Les sorties du jour, les films à venir (Upcoming) et les films actuellement en salle (Now Playing)
     */
    initGlobalCatalog(): void {
        // 1. Préparation des dates clés de l'industrie du cinéma (les mercredis)
        const currentWednesday = this.dateUtilsService.getCurrentWednesday();
        const nextWednesday = this.dateUtilsService.getNextWednesday();
        const nextMonth = this.dateUtilsService.getNextMonth();
        const prevWednesday = this.dateUtilsService.getPreviousWednesday();

        // Génère les listes de tous les mercredis inclus dans ces périodes
        const upcomingReleases = this.dateUtilsService.getWednesdaysUpcomingList(nextWednesday, nextMonth);
        const nowPlayingReleases = this.dateUtilsService.getWednesdaysUpcomingList(prevWednesday, currentWednesday);

        // 2. Préparation des 3 requêtes HTTP (with_release_type: '3' = Uniquement les sorties cinéma officielles en salle)

        // Flux A : Les films qui sortent EXACTEMENT ce mercredi
        const release$ = this.fetchMoviesForSearch({
            language: 'fr-FR', region: 'FR', with_release_type: '3',
            'release_date.gte': this.dateUtilsService.formatDate(currentWednesday),
            'release_date.lte': this.dateUtilsService.formatDate(currentWednesday)
        }, currentWednesday);

        // Flux B : Les films qui vont sortir entre mercredi prochain et le mois prochain
        const upcoming$ = this.fetchMoviesForSearch({
            language: 'fr-FR', region: 'FR', with_release_type: '3',
            'release_date.gte': this.dateUtilsService.formatDate(nextWednesday),
            'release_date.lte': this.dateUtilsService.formatDate(nextMonth)
        }, nextWednesday, upcomingReleases);

        // Flux C : Les films toujours à l'affiche (sortis 12 semaines avant et aujourd'hui), score de popularité minimum de 5
        const nowplaying$ = this.fetchMoviesForSearch({
            language: 'fr-FR', region: 'FR', with_release_type: '3',
            'release_date.gte': this.dateUtilsService.formatDate(prevWednesday),
            'release_date.lte': this.dateUtilsService.formatDate(currentWednesday)
        }, prevWednesday, nowPlayingReleases, 5);

        // 3. Exécution simultanée des requêtes
        // forkJoin attend que les 3 flux soient terminés, puis rassemble les résultats dans un tableau unique
        forkJoin([release$, upcoming$, nowplaying$]).pipe(
            // On fusionne les 3 sous-tableaux de films en un seul et unique grand tableau plat grâce à l'opérateur spread (...)
            map(([release, upcoming, nowplaying]) => {
                return [...release, ...upcoming, ...nowplaying];
            })
        ).subscribe({
            next: (allMovies) => {
                // 4. Nettoyage des doublons (un film peut théoriquement être présent dans deux requêtes différentes)
                const uniqueMovies = allMovies.filter((movie, index, self) =>
                    self.findIndex(m => m.id === movie.id) === index
                );

                // 5. On envoie la liste finale nettoyée dans notre BehaviorSubject. 
                // C'est à ce moment précis que tous les composants abonnés reçoivent les films d'un coup !
                this.loadedMovies$.next(uniqueMovies);
            }
        })
    }

    /**
     * Permet aux composants extérieurs de s'abonner au catalogue
     * sous forme d'Observable "lecture seule" (ils ne peuvent pas modifier le catalogue par erreur)
     */
    getAvailableMovies(): Observable<Movie[]> {
        return this.loadedMovies$.asObservable();
    }

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
     * Récupère les films qui sont à l'affiche entre le mercredi 12 semaines avant et le mercredi de la semaine en cours.
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

    /**
     * Récupère les informations détaillées d'un film selon son ID.
     * Utilise append_to_response pour récupérer des ressources complémentaires (credits, videos, release_dates) en une seule requête HTTP.
     * @param {number} movieId - ID du film.
     * @returns {Observable<MovieDetail>} Un Observable contenant les détails complets du film.
     */
    getMovieById(movieId: number): Observable<MovieDetail> {
        return this.http.get<MovieDetail>(`${environment.tmdbUrl}/movie/${movieId}?append_to_response=credits,videos,release_dates`, {
            headers: { Authorization: `Bearer ${environment.tmdbToken}` },
            params: {
                language: 'fr-FR',
                region: 'FR'
            }
        });
    }
}