import { Movie } from "./movie";

export interface DiscoverMoviesResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}