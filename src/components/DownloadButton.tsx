"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@once-ui-system/core';
import { downloadManager } from '@/services/downloadManager';
import { MangaDetail, ChapterDetail } from '@/types/api';
import { api } from '@/services/api';

interface DownloadButtonProps {
    manga: MangaDetail;
    chapter: ChapterDetail;
    images: string[];
}

export const DownloadButton = ({ manga, chapter, images }: DownloadButtonProps) => {
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        checkStatus();
    }, [chapter.chapter_id]);

    const checkStatus = async () => {
        const status = await downloadManager.isChapterDownloaded(chapter.chapter_id);
        setIsDownloaded(status);
    };

    const handleDownload = async () => {
        if (isDownloading) return;

        setIsDownloading(true);
        try {
            const chapterListResponse = await api.getChapterList(manga.manga_id, { page: 1, page_size: 1000, sort_by: 'chapter_number', sort_order: 'desc' });
            const chapterList = chapterListResponse.data.map(c => ({ id: c.chapter_id, number: c.chapter_number }));
            
            await downloadManager.saveChapter(manga, chapter, images, chapterList);
            setIsDownloaded(true);
        } catch (error) {
            console.error("Download failed:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDelete = async () => {
        await downloadManager.removeChapter(chapter.chapter_id);
        setIsDownloaded(false);
    };

    if (isDownloaded) {
        return (
            <Button
                variant="tertiary"
                size="s"
                onClick={handleDelete}
                prefixIcon="trash"
            >
                Downloaded
            </Button>
        );
    }

    return (
        <Button
            variant="secondary"
            size="s"
            onClick={handleDownload}
            loading={isDownloading}
            prefixIcon="download"
        >
            {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
    );
};
