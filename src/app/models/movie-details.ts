import { Genre } from "./movie-genres";

export interface Cast {
    id: number;
    name: string;
    character: string;      
    profile_path: string;   
}

export interface Crew {
    id: number;
    name: string;
    job: string;        
    department: string;
}

export interface VideoResult {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    name: string;
    key: string;        // 🔑 C'est l'identifiant unique de la vidéo YouTube !
    site: string;       // "YouTube" ou "Vimeo"
    size: number;
    type: string;       // "Trailer", "Teaser", "Clip", etc.
    official: boolean;
}

export interface ReleaseDates {
    results: Array<{
      iso_3166_1: string; // Le code pays (ex: "FR", "US")
      release_dates: Array<{
        certification: string; 
        descriptors: string[];
        iso_639_1: string;
        note: string;
        release_date: string;
        type: number; // 3 = Sortie Cinéma Standard, 1 = Première, etc.
      }>;
    }>;
}

export interface MovieDetail {
    adult: boolean;
    backdrop_path: string;
    budget: number;          
    genres: Genre[];         
    id: number;
    title: string;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number; 
    poster_path: string;
    release_date: string;
    revenue: number;         
    runtime: number;         
    tagline: string;         
    video: boolean;
    vote_average: number;
    vote_count: number;
    credits?: {
        cast: Cast[];
        crew: Crew[];
    };
    videos?: {
        results: VideoResult[];
    };
    release_dates?: ReleaseDates;
}