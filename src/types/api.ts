export interface ApiResponse<T> {
    retcode: number;
    message: string;
    meta: {
        request_id: string;
        timestamp: number;
        process_time: string;
        page?: number;
        page_size?: number;
        total_page?: number;
        total_record?: number;
    };
    data: T;
    facet?: any;
}

export interface TaxonomyItem {
    taxonomy_id?: number;
    name: string;
    slug: string;
}

export interface Taxonomy {
    Artist?: TaxonomyItem[];
    Author?: TaxonomyItem[];
    Format?: TaxonomyItem[];
    Genre?: TaxonomyItem[];
    Type?: TaxonomyItem[];
}

export interface MangaListItem {
    manga_id: string;
    title: string;
    alternative_title: string;
    description: string;
    cover_image_url: string;
    cover_portrait_url: string;
    release_year: string;
    status: number;
    view_count: number;
    user_rate: number;
    bookmark_count: number;
    latest_chapter_id: string;
    latest_chapter_number: number;
    latest_chapter_time: string;
    country_id: string;
    rank: number;
    is_recommended: boolean;
    taxonomy: Taxonomy;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    chapters?: {
        chapter_id: string;
        chapter_number: number;
        created_at: string;
    }[];
}

export interface MangaDetail extends MangaListItem {
    id: number;
}

export interface ChapterListItem {
    chapter_id: string;
    manga_id: string;
    chapter_number: number;
    chapter_title: string;
    view_count: number;
    release_date: string;
    created_at: string;
    updated_at: string;
}

export interface ChapterDetail {
    chapter_id: string;
    manga_id: string;
    chapter_number: number;
    chapter_title: string;
    base_url: string;
    base_url_low: string;
    chapter: {
        path: string;
        data: string[];
    };
    thumbnail_image_url: string;
    view_count: number;
    prev_chapter_id: string | null;
    prev_chapter_number: number | null;
    next_chapter_id: string | null;
    next_chapter_number: number | null;
    release_date: string;
    created_at: string;
    updated_at: string;
}

export interface TopMangaFilter {
    filter: 'daily' | 'weekly' | 'all_time';
}

export interface MangaListParams {
    page?: number;
    page_size?: number;
    q?: string;
    genre_include?: string;
    genre_include_mode?: 'and' | 'or';
    genre_exclude?: string;
    genre_exclude_mode?: 'and' | 'or';
    format?: string;
    type?: string;
    author?: string;
    artist?: string;
    status?: string;
    sort?: string;
    sort_order?: 'asc' | 'desc';
    is_recommended?: boolean;
    release_year?: string;
    is_update?: boolean;
}
