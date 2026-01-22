import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MangaDetail, ChapterDetail } from '@/types/api';
import { api } from '@/services/api';

interface DownloadDB extends DBSchema {
    downloads: {
        key: string; // chapterId
        value: {
            mangaId: string;
            chapterId: string;
            mangaTitle: string;
            chapterNumber: number;
            coverUrl: string;
            timestamp: number;
            totalPages: number;
            mangaDetail: MangaDetail;
            chapterDetail: ChapterDetail;
            chapterList: { id: string; number: number }[];
        };
        indexes: { 'by-manga': string };
    };
    images: {
        key: string; // chapterId-pageIndex
        value: Blob;
    };
    covers: {
        key: string; // mangaId
        value: Blob;
    };
}

const DB_NAME = 'bello-downloads';
const DB_VERSION = 3; // Increment version for new store

let dbPromise: Promise<IDBPDatabase<DownloadDB>>;

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<DownloadDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('downloads')) {
                    const downloadStore = db.createObjectStore('downloads', { keyPath: 'chapterId' });
                    downloadStore.createIndex('by-manga', 'mangaId');
                }
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images');
                }
                if (!db.objectStoreNames.contains('covers')) {
                    db.createObjectStore('covers');
                }
            },
        });
    }
    return dbPromise;
};

export const downloadManager = {
    async saveChapter(manga: MangaDetail, chapter: ChapterDetail, images: string[], chapterList: { id: string; number: number }[]) {
        const db = await getDB();

        // Save metadata
        await db.put('downloads', {
            mangaId: manga.manga_id,
            chapterId: chapter.chapter_id,
            mangaTitle: manga.title,
            chapterNumber: chapter.chapter_number,
            coverUrl: manga.cover_image_url,
            timestamp: Date.now(),
            totalPages: images.length,
            mangaDetail: manga,
            chapterDetail: chapter,
            chapterList: chapterList
        });

        // Save cover image if not already saved
        const existingCover = await db.get('covers', manga.manga_id);
        if (!existingCover && manga.cover_image_url) {
            try {
                const proxyUrl = `/api/proxy?url=${encodeURIComponent(manga.cover_image_url)}`;
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    await db.put('covers', blob, manga.manga_id);
                }
            } catch (error) {
                console.error(`Failed to download cover for ${manga.title}`, error);
            }
        }

        // Fetch and save chapter images
        await Promise.all(images.map(async (url, index) => {
            try {
                const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error(`Proxy failed: ${response.statusText}`);
                const blob = await response.blob();
                await db.put('images', blob, `${chapter.chapter_id}-${index}`);
            } catch (error) {
                console.error(`Failed to download image ${index} for chapter ${chapter.chapter_id}`, error);
            }
        }));
    },

    async getChapterImages(chapterId: string): Promise<string[]> {
        const db = await getDB();
        const download = await db.get('downloads', chapterId);

        if (!download) return [];

        const images: string[] = [];
        for (let i = 0; i < download.totalPages; i++) {
            const blob = await db.get('images', `${chapterId}-${i}`);
            if (blob) {
                images.push(URL.createObjectURL(blob));
            }
        }
        return images;
    },

    async isChapterDownloaded(chapterId: string): Promise<boolean> {
        const db = await getDB();
        const download = await db.get('downloads', chapterId);
        return !!download;
    },

    async removeChapter(chapterId: string) {
        const db = await getDB();
        const download = await db.get('downloads', chapterId);

        if (download) {
            // Remove images
            for (let i = 0; i < download.totalPages; i++) {
                await db.delete('images', `${chapterId}-${i}`);
            }
            // Remove metadata
            await db.delete('downloads', chapterId);
        }
    },

    async getDownloadsByManga(mangaId: string) {
        const db = await getDB();
        return db.getAllFromIndex('downloads', 'by-manga', mangaId);
    },

    async downloadChapterById(chapterId: string, manga: MangaDetail) {
        try {
            const chapterDetail = await api.getChapterDetail(chapterId);
            if (!chapterDetail.data) throw new Error("Chapter data not found");

            const images = chapterDetail.data.chapter.data.map(filename =>
                `${chapterDetail.data.base_url}${chapterDetail.data.chapter.path}${filename}`
            );

            const chapterListResponse = await api.getChapterList(manga.manga_id, { page: 1, page_size: 1000, sort_by: 'chapter_number', sort_order: 'desc' });
            const chapterList = chapterListResponse.data.map(c => ({ id: c.chapter_id, number: c.chapter_number }));

            await this.saveChapter(manga, chapterDetail.data, images, chapterList);
        } catch (error) {
            console.error(`Failed to download chapter ${chapterId}`, error);
            throw error;
        }
    },

    async getAllDownloads() {
        const db = await getDB();
        return db.getAll('downloads');
    },

    async getDownload(chapterId: string) {
        const db = await getDB();
        return db.get('downloads', chapterId);
    },

    async getCoverImage(mangaId: string): Promise<string | null> {
        const db = await getDB();
        const blob = await db.get('covers', mangaId);
        if (blob) {
            return URL.createObjectURL(blob);
        }
        return null;
    }
};
