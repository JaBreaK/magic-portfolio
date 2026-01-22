"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Reader } from "@/components";
import { downloadManager } from "@/services/downloadManager";
import { Column, Text, Flex, Button } from "@once-ui-system/core";
import { useParams } from "next/navigation";
import { ChapterDetail, MangaDetail } from "@/types/api";

export default function ChapterPage() {
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{
        chapter: ChapterDetail;
        manga: MangaDetail;
        chapterList: { id: string; number: number }[];
    } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                // Try fetching from API first
                try {
                    const chapter = await api.getChapterDetail(id);
                    const manga = await api.getMangaDetail(chapter.data.manga_id);
                    const chapters = await api.getChapterList(chapter.data.manga_id, { page: 1, page_size: 1000, sort_by: 'chapter_number', sort_order: 'desc' });

                    setData({
                        chapter: chapter.data,
                        manga: manga.data,
                        chapterList: chapters.data.map(c => ({ id: c.chapter_id, number: c.chapter_number }))
                    });
                    setLoading(false);
                    return;
                } catch (apiError) {
                    console.warn("API fetch failed, checking offline storage...", apiError);
                }

                // Fallback to offline storage
                const download = await downloadManager.getDownload(id);
                if (download && download.chapterDetail && download.mangaDetail && download.chapterList) {
                    setData({
                        chapter: download.chapterDetail,
                        manga: download.mangaDetail,
                        chapterList: download.chapterList
                    });
                    setLoading(false);
                } else {
                    throw new Error("Chapter not found online or offline.");
                }

            } catch (err) {
                console.error("Failed to load chapter:", err);
                setError("Failed to load chapter. Please check your connection.");
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    if (loading) {
        return (
            <Flex fillWidth fillHeight horizontal="center" vertical="center" style={{ minHeight: '100vh' }}>
                <Text>Loading chapter...</Text>
            </Flex>
        );
    }

    if (error || !data) {
        return (
            <Column fillWidth fillHeight horizontal="center" vertical="center" gap="16" style={{ minHeight: '100vh' }}>
                <Text variant="heading-strong-m">Error</Text>
                <Text onBackground="neutral-weak">{error || "Chapter not found."}</Text>
                <Button onClick={() => window.location.reload()}>Retry</Button>
                <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
            </Column>
        );
    }

    return (
        <Reader
            chapter={data.chapter}
            manga={data.manga}
            chapterList={data.chapterList}
        />
    );
}
