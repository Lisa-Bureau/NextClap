export interface ReleaseDate {
    certification: string;
    iso_639_1: string;
    release_date: string;
    type: number;
}

export interface CountryRelease {
    iso_3166_1: string;
    release_dates: ReleaseDate[];
}

export interface ReleaseDatesResponse {
    id: number;
    results: CountryRelease[];
}