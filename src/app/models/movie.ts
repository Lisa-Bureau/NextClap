export interface Movie {
    adult: boolean,
    backdrop_path: string,
    genre_ids: number[],
    genres: string[],
    id: number,
    title: string,
    original_language: string,
    original_title: string,
    overview: string,
    popularity: number, 
    poster_path: string,
    release_date: string,
    softcore: boolean,
    video: boolean,
    vote_average: number,
    vote_count: number
}

export interface DiscoverMoviesResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface MovieWithTag extends Movie {
  categoryTag?: 'release' | 'upcoming' | 'nowplaying';
}