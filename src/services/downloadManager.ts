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
        };
        indexes: { 'by-manga': string };
    };
    images: {
        key: string; // chapterId-pageIndex
        value: Blob;
    };
}

const DB_NAME = 'bello-downloads';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DownloadDB>>;

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<DownloadDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const downloadStore = db.createObjectStore('downloads', { keyPath: 'chapterId' });
                downloadStore.createIndex('by-manga', 'mangaId');
                db.createObjectStore('images');
            },
        });
    }
    return dbPromise;
};

export const downloadManager = {
    async saveChapter(manga: MangaDetail, chapter: ChapterDetail, images: string[]) {
        const db = await getDB();

        // Save metadata
        await db.put('downloads', {
            mangaId: manga.manga_id,
            chapterId: chapter.chapter_id,
            mangaTitle: manga.title,
            chapterNumber: chapter.chapter_number,
            coverUrl: manga.cover_image_url,
            timestamp: Date.now(),
            totalPages: images.length
        });

        // Fetch and save images
        await Promise.all(images.map(async (url, index) => {
            try {
                // Use proxy to bypass CORS
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

            await this.saveChapter(manga, chapterDetail.data, images);
        } catch (error) {
            console.error(`Failed to download chapter ${chapterId}`, error);
            throw error;
        }
    },

    async getAllDownloads() {
        const db = await getDB();
        return db.getAll('downloads');
    }
};
