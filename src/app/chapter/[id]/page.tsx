import { api } from "@/services/api";
import { Reader } from "@/components";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ChapterPage({ params }: PageProps) {
    const { id } = await params;
    const chapter = await api.getChapterDetail(id);
    const manga = await api.getMangaDetail(chapter.data.manga_id);
    const chapters = await api.getChapterList(chapter.data.manga_id, { page: 1, page_size: 1000, sort_by: 'chapter_number', sort_order: 'desc' });

    return (
        <Reader
            chapter={chapter.data}
            manga={manga.data}
            chapterList={chapters.data.map(c => ({ id: c.chapter_id, number: c.chapter_number }))}
        />
    );
}
