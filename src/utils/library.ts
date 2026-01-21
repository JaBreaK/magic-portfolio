import { MangaDetail, ChapterDetail, MangaListItem } from "@/types/api";
import { api } from "@/services/api";

const BOOKMARKS_KEY = 'manga_bookmarks_v2'; // Changed key to avoid conflict/migration issues
const HISTORY_KEY = 'manga_history';

export interface HistoryItem {
    mangaId: string;
    chapterId: string;
    chapterNumber: number;
    timestamp: number;
    mangaTitle: string;
    coverUrl: string;
    imageIndex?: number; // Track reading progress
}

export interface BookmarkItem {
    mangaId: string;
    title: string;
    coverUrl: string;
    latestChapterNumber: number;
    latestChapterId: string;
    timestamp: number;
    hasUpdate?: boolean; // Local flag for UI
    newChapterNumber?: number; // Local flag for UI
}

// --- Bookmarks ---

export const getBookmarks = (): BookmarkItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const toggleBookmark = (manga: MangaListItem | MangaDetail) => {
    if (typeof window === 'undefined') return [];
    const bookmarks = getBookmarks();
    const index = bookmarks.findIndex(b => b.mangaId === manga.manga_id);

    if (index > -1) {
        bookmarks.splice(index, 1);
    } else {
        bookmarks.unshift({
            mangaId: manga.manga_id,
            title: manga.title,
            coverUrl: manga.cover_image_url,
            latestChapterNumber: manga.latest_chapter_number,
            latestChapterId: manga.latest_chapter_id,
            timestamp: Date.now()
        });
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return bookmarks;
};

export const isBookmarked = (mangaId: string): boolean => {
    return getBookmarks().some(b => b.mangaId === mangaId);
};

export const checkBookmarkUpdates = async (): Promise<BookmarkItem[]> => {
    if (typeof window === 'undefined') return [];
    
    const bookmarks = getBookmarks();
    if (bookmarks.length === 0) return [];

    try {
        // Fetch latest 100 updated manga
        const response = await api.getMangaList({ 
            sort: 'latest', 
            page_size: 100,
            is_update: true 
        });

        if (!response.data) return bookmarks;

        let hasChanges = false;
        const updatedBookmarks = bookmarks.map(bookmark => {
            const match = response.data.find(m => m.manga_id === bookmark.mangaId);
            if (match) {
                // Check if there is a newer chapter
                if (match.latest_chapter_number > bookmark.latestChapterNumber) {
                    // Update the bookmark with new info and flag it
                    hasChanges = true;
                    return {
                        ...bookmark,
                        latestChapterNumber: match.latest_chapter_number,
                        latestChapterId: match.latest_chapter_id,
                        hasUpdate: true,
                        newChapterNumber: match.latest_chapter_number
                    };
                }
            }
            return bookmark;
        });

        if (hasChanges) {
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
            return updatedBookmarks;
        }
    } catch (error) {
        console.error("Failed to check for updates:", error);
    }

    return bookmarks;
};

// --- History ---

export const addToHistory = (manga: MangaDetail, chapter: ChapterDetail, imageIndex: number = 0) => {
    if (typeof window === 'undefined') return;
    const history = getHistory();

    const newItem: HistoryItem = {
        mangaId: manga.manga_id,
        chapterId: chapter.chapter_id,
        chapterNumber: chapter.chapter_number,
        timestamp: Date.now(),
        mangaTitle: manga.title,
        coverUrl: manga.cover_image_url,
        imageIndex: imageIndex
    };

    // Remove existing entry for this manga
    const filtered = history.filter(h => h.mangaId !== manga.manga_id);
    filtered.unshift(newItem);

    // Limit history size
    if (filtered.length > 50) filtered.pop();

    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
};

export const getHistory = (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
};
