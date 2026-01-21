import { ApiResponse, MangaListItem, MangaDetail, ChapterListItem, ChapterDetail, MangaListParams, TopMangaFilter, TaxonomyItem } from '../types/api';

const API_BASE_URL = 'https://api.shngm.io/v1';

async function fetchApi<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    getMangaList: (params?: MangaListParams) =>
        fetchApi<MangaListItem[]>('/manga/list', params),

    getMangaDetail: (mangaId: string) =>
        fetchApi<MangaDetail>(`/manga/detail/${mangaId}`),

    getChapterList: (mangaId: string, params?: { page?: number; page_size?: number; sort_by?: string; sort_order?: string }) =>
        fetchApi<ChapterListItem[]>(`/chapter/${mangaId}/list`, params),

    getChapterDetail: (chapterId: string) =>
        fetchApi<ChapterDetail>(`/chapter/detail/${chapterId}`),

    getTopManga: (filter: TopMangaFilter['filter'] = 'weekly') =>
        fetchApi<MangaListItem[]>('/manga/top', { filter }),

    getGenres: () => fetchApi<TaxonomyItem[]>('/genre/list'),
    getFormats: () => fetchApi<any>('/format/list'),
    getTypes: () => fetchApi<any>('/type/list'),
};
